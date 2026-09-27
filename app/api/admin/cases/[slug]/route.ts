import { cookies } from "next/headers";
import { SESSION_COOKIE, sameOrigin, verifySession } from "@/lib/admin/auth";
import { ValidationError, saveCase } from "@/lib/admin/content";

const MAX_BODY = 100_000; // bytes

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Origem não permitida." }, { status: 403 });

  const jar = await cookies();
  if (!verifySession(jar.get(SESSION_COOKIE)?.value)) {
    return Response.json({ error: "Sessão expirada. Entre de novo em /admin." }, { status: 401 });
  }

  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return Response.json({ error: "Case inválido." }, { status: 400 });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "Conteúdo grande demais." }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Conteúdo inválido." }, { status: 400 });
  }

  try {
    const mode = await saveCase(slug, body);
    return Response.json({ ok: true, mode });
  } catch (err) {
    if (err instanceof ValidationError) return Response.json({ error: err.message }, { status: 400 });
    console.error("[admin] falha ao salvar case", err);
    return Response.json({ error: "Não foi possível salvar agora. Tente de novo." }, { status: 502 });
  }
}
