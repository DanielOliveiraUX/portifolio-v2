import { revalidateTag } from "next/cache";
import { errorResponse, guard } from "@/lib/admin/guard";
import { ValidationError, getSiteForEdit, saveSite, storageMode } from "@/lib/admin/content";
import { SITE_TAG, resolveImage } from "@/lib/content";

const MAX_BODY = 60_000; // bytes

/** Textos e imagens do site (sempre a versão mais recente, sem cache). */
export async function GET(request: Request) {
  const denied = await guard(request, { write: false });
  if (denied) return denied;
  try {
    const site = await getSiteForEdit();
    // URL final das imagens, para pré-visualizar no editor
    const previews = { heroImage: resolveImage(site.hero.image).src, bioImage: resolveImage(site.bio.image).src };
    return Response.json({ site, previews }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[admin] falha ao carregar o site", err);
    return Response.json({ error: "Não foi possível carregar os textos do site." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  const raw = await request.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "Conteúdo grande demais." }, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Conteúdo inválido." }, { status: 400 });
  }

  try {
    await saveSite(body);
    revalidateTag(SITE_TAG, { expire: 0 });
    return Response.json({ ok: true, mode: storageMode() });
  } catch (err) {
    return errorResponse(err, "Não foi possível salvar agora. Tente de novo.", ValidationError);
  }
}
