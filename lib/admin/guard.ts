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

/** Converte erros das operações do editor em respostas amigáveis. */
export function errorResponse(err: unknown, fallback: string, ValidationErrorClass: new (...a: never[]) => Error) {
  if (err instanceof ValidationErrorClass) return Response.json({ error: err.message }, { status: 400 });
  console.error("[admin]", fallback, err);
  if (err instanceof Error && err.message.includes("409")) {
    return Response.json({ error: "O conteúdo mudou enquanto você editava. Recarregue a página e tente de novo." }, { status: 409 });
  }
  return Response.json({ error: fallback }, { status: 502 });
}
