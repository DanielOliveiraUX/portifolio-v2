// Formato do conteúdo dos cases (data/cases.json). Usado no servidor e no editor.

export type CaseImage = { src: string; alt: string };

export type CaseSection = {
  id: string;
  title: string;
  paragraphs: string[];
  image?: CaseImage;
};

/** Um case como está guardado no arquivo. */
export type CaseData = {
  slug: string;
  featured: boolean;
  meta: string;
  title: string;
  summary: string;
  bullets: string[];
  /** Página HTML (em public/) exibida em iframe no lugar da capa do card na home. */
  coverEmbed?: string;
  /** A primeira imagem da galeria é a capa do card na home. */
  gallery: CaseImage[];
  intro: string;
  sections: CaseSection[];
};

export type CasesFile = { projects: CaseData[] };

/** Textos e imagens do site fora dos cases (data/site.json). */
export type SiteData = {
  hero: { role: string; location: string; image: CaseImage };
  /** Seção verde: cada parágrafo é uma lista de linhas; trechos entre **asteriscos** saem em negrito. */
  about: { paragraphs: string[][] };
  bio: { paragraphs: string[]; image: CaseImage };
  contact: {
    /** Quebra de linha vira quebra no título. */
    title: string;
    ctaLabel: string;
    ctaUrl: string;
    email: string;
    linkedin: string;
    footer: string;
  };
  seo: { title: string; description: string };
};

/** Case pronto para exibir: imagens com URL final e rótulo da aba ("Projeto 01"). */
export type Project = CaseData & { tab: string; cover: CaseImage };
