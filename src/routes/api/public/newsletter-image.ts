import { createFileRoute } from "@tanstack/react-router";

const BUCKET = "newsletter-images";

// Public route that streams newsletter images from the private storage bucket,
// so every reader/evaluator can see them without exposing the bucket publicly.
// The bucket has no anon/authenticated RLS policies — only the server-side
// service role (used here) can read it, so files are never directly accessible.
export const Route = createFileRoute("/api/public/newsletter-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path");

        if (!path || path.includes("..")) {
          return new Response("Bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { data, error } = await supabaseAdmin.storage
          .from(BUCKET)
          .download(path);

        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(data, {
          status: 200,
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
