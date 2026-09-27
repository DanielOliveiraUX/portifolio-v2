import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sameOrigin, verifySession } from "./auth";

/** Devolve uma resposta de erro se o pedido não vier de uma sessão válida do próprio site. */
export async function guard(request: Request, { write = true } = {}) {
  if (write && !sameOrigin(request)) return Response.json({ error: "Origem não permitida." }, { status: 403 });
  const jar = await cookies();
  if (!verifySession(jar.get(SESSION_COOKIE)?.value)) {
    return Response.json({ error: "Sessão expirada. Entre de novo em /admin." }, { status: 401 });
  }
  return null;
}
