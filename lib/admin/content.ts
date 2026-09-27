import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CaseText } from "@/data/projects";

type Cases = Record<string, CaseText>;

/** O que o editor pode mudar. Bullets e imagens ficam de fora. */
export type CaseEdit = {
  title: string;
  meta: string;
  summary: string;
  intro: string;
  sections: { id: string; title: string; paragraphs: string[] }[];
};

const FILE = "data/cases.json";

const LIMITS = { short: 200, summary: 600, long: 4000, paragraphs: 20 };

function cleanText(v: unknown, max: number, field: string, allowEmpty = false) {
  if (typeof v !== "string") throw new ValidationError(`${field}: texto inválido`);
  const s = v.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  if (!allowEmpty && !s) throw new ValidationError(`${field}: não pode ficar vazio`);
  if (s.length > max) throw new ValidationError(`${field}: passou de ${max} caracteres`);
  return s;
}

export class ValidationError extends Error {}

/** Valida o corpo enviado pelo editor contra o case atual e devolve o case atualizado. */
export function applyEdit(current: CaseText, body: unknown): CaseText {
  if (!body || typeof body !== "object") throw new ValidationError("Conteúdo inválido");
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.sections) || b.sections.length !== current.sections.length) {
    throw new ValidationError("As seções não batem com o case atual");
  }

  const sections = current.sections.map((sec, i) => {
    const incoming = b.sections as unknown[];
    const s = incoming[i] as Record<string, unknown> | undefined;
    if (!s || s.id !== sec.id) throw new ValidationError("As seções não batem com o case atual");
    if (!Array.isArray(s.paragraphs) || s.paragraphs.length > LIMITS.paragraphs) {
      throw new ValidationError(`${sec.title}: parágrafos inválidos`);
    }
    const paragraphs = s.paragraphs
      .map((p, j) => cleanText(p, LIMITS.long, `${sec.title}, parágrafo ${j + 1}`, true))
      .filter(Boolean);
    if (!paragraphs.length) throw new ValidationError(`${sec.title}: precisa de pelo menos um parágrafo`);
    return { ...sec, title: cleanText(s.title, LIMITS.short, "Título da seção"), paragraphs };
  });

  return {
    ...current,
    title: cleanText(b.title, LIMITS.short, "Título"),
    meta: cleanText(b.meta, LIMITS.short, "Linha de contexto"),
    summary: cleanText(b.summary, LIMITS.summary, "Resumo"),
    intro: cleanText(b.intro, LIMITS.long, "Introdução"),
    sections,
  };
}

const serialize = (cases: Cases) => JSON.stringify(cases, null, 2) + "\n";

// ---------- GitHub (site publicado) ----------

function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { token, repo, branch: process.env.GITHUB_BRANCH || "main" };
}

async function github(url: string, token: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${url}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
  return res.json();
}

export function storageMode() {
  if (githubConfig()) return "github" as const;
  if (process.env.NODE_ENV !== "production") return "local" as const;
  return null;
}

/** Salva o case. No site publicado, cria um commit no GitHub (a Vercel republica sozinha). */
export async function saveCase(slug: string, body: unknown) {
  const gh = githubConfig();

  if (gh) {
    const url = `/repos/${gh.repo}/contents/${FILE}`;
    const file = await github(`${url}?ref=${encodeURIComponent(gh.branch)}`, gh.token);
    const cases = JSON.parse(Buffer.from(file.content, "base64").toString("utf8")) as Cases;
    if (!Object.hasOwn(cases, slug)) throw new ValidationError("Case não encontrado");
    cases[slug] = applyEdit(cases[slug], body);
    await github(url, gh.token, {
      method: "PUT",
      body: JSON.stringify({
        message: `content: atualiza textos do case ${slug} pelo editor do site`,
        content: Buffer.from(serialize(cases), "utf8").toString("base64"),
        sha: file.sha,
        branch: gh.branch,
      }),
    });
    return "github" as const;
  }

  if (process.env.NODE_ENV !== "production") {
    const full = path.join(process.cwd(), FILE);
    const cases = JSON.parse(await readFile(full, "utf8")) as Cases;
    if (!Object.hasOwn(cases, slug)) throw new ValidationError("Case não encontrado");
    cases[slug] = applyEdit(cases[slug], body);
    await writeFile(full, serialize(cases), "utf8");
    return "local" as const;
  }

  throw new Error("Editor sem destino de gravação configurado");
}
