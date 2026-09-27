import { guard } from "@/lib/admin/guard";
import { MAX_IMAGE_BYTES, ValidationError, uploadImage } from "@/lib/admin/content";
import { resolveImage } from "@/lib/content";

/** Recebe uma imagem do editor e devolve o caminho salvo e a URL para pré-visualizar. */
export async function POST(request: Request) {
  const denied = await guard(request);
  if (denied) return denied;

  const size = Number(request.headers.get("content-length") || 0);
  if (size > MAX_IMAGE_BYTES + 64 * 1024) {
    return Response.json({ error: "Imagem maior que 4 MB. Reduza o tamanho e tente de novo." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const slug = String(form?.get("slug") ?? "");
  if (!(file instanceof File)) return Response.json({ error: "Nenhuma imagem enviada." }, { status: 400 });

  try {
    const src = await uploadImage(file, slug);
    return Response.json({ ok: true, src, url: resolveImage({ src, alt: "" }).src });
  } catch (err) {
    if (err instanceof ValidationError) return Response.json({ error: err.message }, { status: 400 });
    console.error("[admin] falha ao enviar imagem", err);
    return Response.json({ error: "Não foi possível enviar a imagem agora." }, { status: 502 });
  }
}
