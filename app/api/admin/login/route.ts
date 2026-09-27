import { cookies } from "next/headers";
import {
  HINT_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  adminConfigured,
  checkPassword,
  clearFailures,
  clientIp,
  cookieOptions,
  createSession,
  loginBlocked,
  registerFailure,
  sameOrigin,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!adminConfigured()) return Response.json({ error: "Editor não configurado no servidor." }, { status: 503 });
  if (!sameOrigin(request)) return Response.json({ error: "Origem não permitida." }, { status: 403 });

  const ip = clientIp(request);
  if (loginBlocked(ip)) {
    return Response.json({ error: "Muitas tentativas. Espere 15 minutos." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";

  if (!checkPassword(password)) {
    registerFailure(ip);
    await new Promise((r) => setTimeout(r, 600)); // atrasa tentativas por força bruta
    return Response.json({ error: "Senha incorreta." }, { status: 401 });
  }

  clearFailures(ip);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSession(), cookieOptions(SESSION_MAX_AGE));
  jar.set(HINT_COOKIE, "1", cookieOptions(SESSION_MAX_AGE, false));
  return Response.json({ ok: true });
}
