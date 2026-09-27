import { revalidateTag } from "next/cache";
import { errorResponse, guard } from "@/lib/admin/guard";
import { ValidationError, deleteCase, saveCase, storageMode } from "@/lib/admin/content";
import { CASES_TAG } from "@/lib/content";

const MAX_BODY = 100_000; // bytes

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

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
    await saveCase(slug, body);
    // Próxima visita já busca o conteúdo novo, sem servir a versão antiga.
    revalidateTag(CASES_TAG, { expire: 0 });
    return Response.json({ ok: true, mode: storageMode() });
  } catch (err) {
    return errorResponse(err, "Não foi possível salvar agora. Tente de novo.", ValidationError);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return Response.json({ error: "Case inválido." }, { status: 400 });
  try {
    await deleteCase(slug);
    revalidateTag(CASES_TAG, { expire: 0 });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, "Não foi possível apagar o artigo agora.", ValidationError);
  }
}
