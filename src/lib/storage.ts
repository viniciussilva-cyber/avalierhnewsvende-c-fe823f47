import { supabase } from "@/integrations/supabase/client";

const BUCKET = "newsletter-images";

/**
 * Uploads an image file to Lovable Cloud storage and returns a public URL
 * that serves the image through our own `/api/public/newsletter-image` route.
 *
 * Images used to be inlined as base64 inside the newsletter HTML, which bloated
 * the document past its size limit and made saves fail (so readers never saw
 * the images). Storing the file in Cloud storage keeps documents small and the
 * images visible to everyone, including people evaluating the RH News.
 */
export async function uploadEditorImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/png",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error(`Falha ao enviar imagem: ${error.message}`);
  }

  // Return an absolute URL to our public image proxy so it works for every reader.
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/api/public/newsletter-image?path=${encodeURIComponent(path)}`;
}
