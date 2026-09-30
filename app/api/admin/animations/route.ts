import { guard } from "@/lib/admin/guard";
import { listAnimations } from "@/lib/admin/content";

/** Animações disponíveis para a capa dos cases. */
export async function GET(request: Request) {
  const denied = await guard(request, { write: false });
  if (denied) return denied;
  try {
    return Response.json({ animations: await listAnimations() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[admin] falha ao listar animações", err);
    return Response.json({ error: "Não foi possível carregar as animações." }, { status: 502 });
  }
}
