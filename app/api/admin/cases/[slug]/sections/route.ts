import { revalidateTag } from "next/cache";
import { errorResponse, guard } from "@/lib/admin/guard";
import { ValidationError, changeSections } from "@/lib/admin/content";
import { CASES_TAG } from "@/lib/content";

/** Adiciona, remove ou move uma seção do case. */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return Response.json({ error: "Case inválido." }, { status: 400 });
  const body = await request.json().catch(() => null);
  try {
    await changeSections(slug, body);
    revalidateTag(CASES_TAG, { expire: 0 });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err, "Não foi possível alterar as seções agora.", ValidationError);
  }
}
