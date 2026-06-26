import { auth } from "@/lib/firebase";

/**
 * Uploads an image file to Lovable Cloud storage through our secure server
 * endpoint and returns a URL that serves the image via `/api/public/newsletter-image`.
 *
 * The storage bucket has NO public read/upload policies. Uploads go through
 * `/api/public/newsletter-image-upload`, which verifies the moderator's Firebase
 * ID token server-side before writing with the service role. Reads go through
 * the proxy route (also service role). This keeps documents small, images
 * visible to every reader, and the bucket fully locked down.
 */
export async function uploadEditorImage(file: File): Promise<string> {
  const idToken = await auth?.currentUser?.getIdToken();
  if (!idToken) {
    throw new Error("Você precisa estar autenticado para enviar imagens.");
  }

  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/public/newsletter-image-upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Falha ao enviar imagem (${res.status}).`);
  }

  const { path } = (await res.json()) as { path: string };

  // Return an absolute URL to our image proxy so it works for every reader.
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/public/newsletter-image?path=${encodeURIComponent(path)}`;
}
