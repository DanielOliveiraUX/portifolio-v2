import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/admin/auth";
import { storageMode } from "@/lib/admin/content";

export async function GET() {
  const jar = await cookies();
  const authenticated = verifySession(jar.get(SESSION_COOKIE)?.value);
  return Response.json(
    { authenticated, mode: authenticated ? storageMode() : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
