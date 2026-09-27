import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import bundled from "@/data/cases.json";
import type { CaseData, CaseImage, CasesFile, Project } from "./content-types";

export type { CaseData, CaseImage, CaseSection, Project } from "./content-types";

// No site publicado o conteúdo é lido do GitHub (data/cases.json) e fica em cache
// com a tag "cases". O editor invalida essa tag ao salvar, então a próxima visita
// já mostra o texto novo, sem esperar um deploy.

export const CASES_TAG = "cases";
export const CASES_FILE = "data/cases.json";
export const UPLOADS_DIR = "public/images/uploads";

export function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

export function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function loadFile(): Promise<CasesFile> {
  const gh = githubConfig();
  if (gh) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${gh.repo}/contents/${CASES_FILE}?ref=${encodeURIComponent(gh.branch)}`,
        { headers: githubHeaders(gh.token), cache: "force-cache", next: { tags: [CASES_TAG] } }
      );
      if (res.ok) {
        const file = await res.json();
        return JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
      }
      console.error(`[content] GitHub respondeu ${res.status}; usando a cópia do deploy`);
    } catch (err) {
      console.error("[content] falha ao ler do GitHub; usando a cópia do deploy", err);
    }
    return bundled as CasesFile;
  }
  // Sem GitHub (desenvolvimento): lê o arquivo do disco para refletir o que o editor gravou.
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), CASES_FILE), "utf8"));
  } catch {
    return bundled as CasesFile;
  }
}

/** Imagens enviadas pelo editor são servidas direto do GitHub até o próximo deploy incluí-las. */
export function resolveImage(img: CaseImage): CaseImage {
  const gh = githubConfig();
  if (gh && img.src.startsWith("/images/uploads/")) {
    return { ...img, src: `https://raw.githubusercontent.com/${gh.repo}/${gh.branch}/public${img.src}` };
  }
  return img;
}

export const tabLabel = (i: number) => `Projeto ${String(i + 1).padStart(2, "0")}`;

function toProject(c: CaseData, i: number): Project {
  const gallery = c.gallery.map(resolveImage);
  return {
    ...c,
    tab: tabLabel(i),
    gallery,
    cover: gallery[0] ?? { src: "/images/placeholder.jpg", alt: "" },
    sections: c.sections.map((s) => (s.image ? { ...s, image: resolveImage(s.image) } : s)),
  };
}

/** Conteúdo cru (como está no arquivo), para o editor. */
export async function getCaseData(slug: string) {
  return (await loadFile()).projects.find((p) => p.slug === slug);
}

export async function getProjects(): Promise<Project[]> {
  return (await loadFile()).projects.map(toProject);
}

export async function getFeaturedProjects() {
  // A numeração das abas da home segue a ordem dos destaques.
  return (await getProjects())
    .filter((p) => p.featured)
    .slice(0, 3)
    .map((p, i) => ({ ...p, tab: tabLabel(i) }));
}

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}

export async function getOtherProjects(slug: string, count = 2) {
  return (await getProjects()).filter((p) => p.slug !== slug).slice(0, count);
}
