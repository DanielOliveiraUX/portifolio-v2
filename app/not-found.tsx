import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container" style={{ paddingBlock: "120px", display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
      <h1 style={{ fontSize: "clamp(34px, 4vw, 60px)", fontWeight: 600, letterSpacing: "-0.035em" }}>Página não encontrada</h1>
      <p style={{ color: "var(--muted)" }}>O endereço pode ter mudado. Os projetos estão todos na página de projetos.</p>
      <Link href="/projetos" className="pill">
        Ver todos os projetos
      </Link>
    </section>
  );
}
