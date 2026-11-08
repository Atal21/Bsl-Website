import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public: serves images uploaded through the admin panel (when stored in the database).
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const store = await getStore();
  const blob = await store.getBlob(params.id);
  if (!blob) return new Response("Not found", { status: 404 });
  const etag = `"${params.id}"`;
  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: { ETag: etag } });
  return new Response(new Uint8Array(blob.data), {
    headers: {
      "Content-Type": blob.mime,
      "Cache-Control": "public, max-age=31536000, immutable", // ids are unique per upload
      "X-Content-Type-Options": "nosniff",
      ETag: etag,
    },
  });
}
