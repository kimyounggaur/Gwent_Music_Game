import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf"
};

export async function GET(_request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const root = path.resolve(process.cwd(), "01 Source");
  const target = path.resolve(root, ...params.path.map((part) => decodeURIComponent(part)));
  if (!target.startsWith(root)) return new Response("Not found", { status: 404 });

  try {
    const file = await fs.readFile(target);
    return new Response(file, {
      headers: {
        "content-type": MIME[path.extname(target).toLowerCase()] ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
