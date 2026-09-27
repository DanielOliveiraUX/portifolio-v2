import { revalidateTag } from "next/cache";
import { errorResponse, guard } from "@/lib/admin/guard";
import { ValidationError, arrangeCases, createCase, listCases } from "@/lib/admin/content";
import { CASES_TAG } from "@/lib/content";

/** Lista os artigos (sempre a versão mais recente, sem cache). */
export async function GET(request: Request) {
  const denied = await guard(request, { write: false });
  if (denied) return denied;
  try {
    return Response.json({ cases: await listCases() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[admin] falha ao listar cases", err);
    return Response.json({ error: "Não foi possível carregar os artigos." }, { status: 502 });
  }
}

/** Cria um artigo novo com a estrutura padrão. */
export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  try {
    const slug = await createCase(body?.title);
    revalidateTag(CASES_TAG, { expire: 0 });
    return Response.json({ ok: true, slug });
  } catch (err) {
    if (err instanceof ValidationError) return Response.json({ error: err.message }, { status: 400 });
    console.error("[admin] falha ao criar case", err);
    return Response.json({ error: "Não foi possível criar o artigo agora." }, { status: 502 });
  }
}

/** Salva a ordem dos artigos e quais aparecem na home. */
export async function PUT(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  try {
    await arrangeCases(body);
    revalidateTag(CASES_TAG, { expire: 0 });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, "Não foi possível salvar a organização agora.", ValidationError);
  }
}
