import { cookies } from "next/headers";
import { HINT_COOKIE, SESSION_COOKIE, sameOrigin } from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Origem não permitida." }, { status: 403 });
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(HINT_COOKIE);
  return Response.json({ ok: true });
}
