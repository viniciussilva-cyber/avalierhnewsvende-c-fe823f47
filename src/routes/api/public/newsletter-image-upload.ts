import { createFileRoute } from "@tanstack/react-router";

const BUCKET = "newsletter-images";

// Firebase project (public) web API key — used only to validate the caller's
// Firebase ID token against Google's Identity Toolkit. Not a secret.
const FIREBASE_API_KEY = "AIzaSyDjkQvOgOClV7T1_kYQUgad_5_aaQ7-F_Q";

// Only these moderators may upload — must match firestore.rules.
const APPROVED_MODERATORS = [
  "vinicius.silva@vende-c.com",
  "lucas.zan@vende-c.com",
];

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

// Validates a Firebase ID token by looking it up via Google's Identity Toolkit
// and returns the verified email (lowercased) or null when invalid/expired.
async function verifyFirebaseEmail(idToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean }>;
    };
    const user = json.users?.[0];
    if (!user?.email) return null;
    return user.email.trim().toLowerCase();
  } catch {
    return null;
  }
}

function extensionFromName(name: string, contentType: string) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (ALLOWED_EXT.has(ext)) return ext;
  return EXT_BY_TYPE[contentType] ?? "png";
}

function createObjectPath(ext: string) {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}

function isSafeRemoteImageUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host === "0.0.0.0" ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      host === "::1"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function uploadToBucket(body: Blob | ArrayBuffer, contentType: string, ext: string) {
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );

  const path = createObjectPath(ext);
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, body, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error("Upload failed");
  }

  return path;
}

// Authenticated upload endpoint. The storage bucket has no public RLS policies;
// uploads happen here only after verifying the caller is an approved moderator
// via their Firebase ID token, then writing with the server service role.
export const Route = createFileRoute("/api/public/newsletter-image-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("Authorization") ?? "";
        const idToken = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : "";

        if (!idToken) {
          return new Response("Unauthorized", { status: 401 });
        }

        const email = await verifyFirebaseEmail(idToken);
        if (!email || !APPROVED_MODERATORS.includes(email)) {
          return new Response("Forbidden", { status: 403 });
        }

        const requestType = request.headers.get("Content-Type") ?? "";
        let path = "";

        if (requestType.includes("application/json")) {
          const { imageUrl } = (await request.json()) as { imageUrl?: string };
          if (!imageUrl || !isSafeRemoteImageUrl(imageUrl)) {
            return new Response("Bad request", { status: 400 });
          }

          const remote = await fetch(imageUrl, {
            headers: { Accept: "image/*" },
          });

          if (!remote.ok) {
            return new Response("Could not fetch image", { status: 422 });
          }

          const contentType = (remote.headers.get("Content-Type") || "")
            .split(";")[0]
            .toLowerCase();
          if (!ALLOWED_TYPES.has(contentType)) {
            return new Response("Unsupported file type", { status: 415 });
          }

          const contentLength = Number(remote.headers.get("Content-Length") || "0");
          if (contentLength > MAX_BYTES) {
            return new Response("File too large", { status: 413 });
          }

          const bytes = await remote.arrayBuffer();
          if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) {
            return new Response("File too large", { status: 413 });
          }

          path = await uploadToBucket(
            bytes,
            contentType,
            extensionFromName(new URL(imageUrl).pathname, contentType)
          );
        } else {
          const form = await request.formData();
          const file = form.get("file");
          if (!(file instanceof File)) {
            return new Response("Bad request", { status: 400 });
          }

          if (file.size === 0 || file.size > MAX_BYTES) {
            return new Response("File too large", { status: 413 });
          }

          const contentType = file.type || "application/octet-stream";
          if (!ALLOWED_TYPES.has(contentType)) {
            return new Response("Unsupported file type", { status: 415 });
          }

          path = await uploadToBucket(
            file,
            contentType,
            extensionFromName(file.name, contentType)
          );
        }

        return new Response(JSON.stringify({ path }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
