import { readFile } from "node:fs/promises";
import path from "node:path";
import { MIME_BY_EXT, UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  if (parts.length !== 1 || !/^[\w.-]+\.(jpg|png|webp)$/.test(parts[0])) return new Response("Introuvable", { status: 404 });
  const file = path.join(UPLOAD_DIR, parts[0]);
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Introuvable", { status: 404 });
  try {
    const data = await readFile(file);
    const ext = parts[0].split(".").pop() as string;
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": MIME_BY_EXT[ext], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Introuvable", { status: 404 });
  }
}
