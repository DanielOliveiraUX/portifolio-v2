// Conteúdo provisório vindo do Figma. Para atualizar um projeto, edite só este arquivo.
// Imagens: coloque os arquivos em /public/images e troque os caminhos abaixo.

export type CaseSection = {
  id: string;
  title: string;
  paragraphs: string[];
  image?: { src: string; alt: string };
};

export type Project = {
  slug: string;
  tab: string;
  meta: string;
  title: string;
  summary: string;
  bullets: string[];
  cover: { src: string; alt: string };
  gallery: { src: string; alt: string }[];
  intro: string;
  sections: CaseSection[];
  featured: boolean;
};

const placeholder = { src: "/images/placeholder.jpg", alt: "" };

const lorem =
  "Senior UX/UI Designer, in-house. Full ownership of designer experience, Figma kit architecture, component design, documentation, and long-term governance.";

const sections = (): CaseSection[] => [
  { id: "visao-geral", title: "Visão geral", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
  { id: "contexto-do-negocio", title: "Contexto do negócio", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`], image: placeholder },
  { id: "pesquisa-e-descoberta", title: "Pesquisa e descoberta", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
  { id: "decisoes-chave", title: "Decisões-chave", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
  { id: "o-que-foi-entregue", title: "O que foi entregue", paragraphs: [`${lorem} ${lorem} ${lorem}`, `${lorem} ${lorem}`] },
];

const base = {
  meta: "France · Global · 2024–2026",
  title: "Veepee · Design System Lead",
  summary: "Scaling a multi-brand e-commerce ecosystem through governance, systems, and AI-assisted workflows.",
  bullets: [
    "Led Design System governance across multiple product and dev teams",
    "Reduced design-to-dev friction through good documentation and UX practices",
    "Facilitated stakeholder alignment in complex, multi-team environments",
  ],
  cover: placeholder,
  gallery: [placeholder, placeholder, placeholder],
  intro: `${lorem} ${lorem} ${lorem}`,
};

export const projects: Project[] = [
  { ...base, slug: "projeto-01", tab: "Projeto 01", sections: sections(), featured: true },
  { ...base, slug: "projeto-02", tab: "Projeto 02", sections: sections(), featured: true },
  { ...base, slug: "projeto-03", tab: "Projeto 03", sections: sections(), featured: true },
];

export const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getOtherProjects(slug: string, count = 2) {
  return projects.filter((p) => p.slug !== slug).slice(0, count);
}
