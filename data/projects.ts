// Estrutura dos projetos (URL, aba, imagens). Os TEXTOS ficam em cases.json,
// que também é o arquivo atualizado pelo editor do site (/admin).
// Imagens: coloque os arquivos em /public/images e troque os caminhos abaixo.
import cases from "./cases.json";

export type CaseSection = {
  id: string;
  title: string;
  paragraphs: string[];
  image?: { src: string; alt: string };
};

/** Campos de texto de um case, guardados em cases.json. */
export type CaseText = {
  meta: string;
  title: string;
  summary: string;
  bullets: string[];
  intro: string;
  sections: CaseSection[];
};

export type Project = CaseText & {
  slug: string;
  tab: string;
  cover: { src: string; alt: string };
  gallery: { src: string; alt: string }[];
  featured: boolean;
};

const texts = cases as Record<string, CaseText>;

const placeholder = { src: "/images/placeholder.jpg", alt: "" };

const concessionariasCover = {
  src: "/images/concessionarias-dashboard.png",
  alt: "Dashboard da plataforma para concessionárias com indicadores de veículos, ações rápidas e gráfico de desempenho",
};

const structure: Omit<Project, keyof CaseText>[] = [
  {
    slug: "concessionarias",
    tab: "Projeto 01",
    cover: concessionariasCover,
    gallery: [concessionariasCover, placeholder, placeholder],
    featured: true,
  },
  { slug: "projeto-02", tab: "Projeto 02", cover: placeholder, gallery: [placeholder, placeholder, placeholder], featured: true },
  { slug: "projeto-03", tab: "Projeto 03", cover: placeholder, gallery: [placeholder, placeholder, placeholder], featured: true },
];

export const projects: Project[] = structure.map((p) => ({ ...p, ...texts[p.slug] }));

export const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getOtherProjects(slug: string, count = 2) {
  return projects.filter((p) => p.slug !== slug).slice(0, count);
}
