import { createFileRoute } from "@tanstack/react-router";

const BUCKET = "newsletter-images";

// Firebase project (public) web API key — used only to validate the caller's
// Firebase ID token against Google's Identity Toolkit. Not a secret.
const FIREBASE_API_KEY = "AIzaSyDjkQvOgOClV7T1_kYQUgad_5_aaQ7-F_Q";

// Only these moderators may upload — must match firestore.rules.
const APPROVED_MODERATORS = [
  "vinicius.silva@vende-c.com",
  "lucas.izan@vende-c.com",
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

        const ext = (file.name.split(".").pop() || "").toLowerCase();
        const safeExt = ALLOWED_EXT.has(ext) ? ext : "png";
        const path = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${safeExt}`;

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { error } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(path, file, {
            contentType,
            cacheControl: "31536000",
            upsert: false,
          });

        if (error) {
          return new Response("Upload failed", { status: 500 });
        }

        return new Response(JSON.stringify({ path }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
