import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CASES_FILE, UPLOADS_DIR, githubConfig, githubHeaders } from "@/lib/content";
import type { CaseData, CaseImage, CasesFile } from "@/lib/content-types";

export class ValidationError extends Error {}

const LIMITS = { short: 200, summary: 600, long: 4000, alt: 300, paragraphs: 20, cases: 50, bullets: 6, sections: 15, featured: 3 };
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // limite de upload das funções da Vercel é 4,5 MB

// ---------- Validação ----------

function cleanText(v: unknown, max: number, field: string, allowEmpty = false) {
  if (typeof v !== "string") throw new ValidationError(`${field}: texto inválido`);
  const s = v
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!allowEmpty && !s) throw new ValidationError(`${field}: não pode ficar vazio`);
  if (s.length > max) throw new ValidationError(`${field}: passou de ${max} caracteres`);
  return s;
}

/** Só aceita imagens do próprio site (pasta /images), nunca URLs externas. */
function cleanImage(v: unknown, field: string): CaseImage {
  const img = v as Partial<CaseImage> | null;
  if (!img || typeof img.src !== "string") throw new ValidationError(`${field}: imagem inválida`);
  if (!/^\/images\/[A-Za-z0-9/_.-]+\.(png|jpe?g|webp|avif|gif)$/i.test(img.src) || img.src.includes("..")) {
    throw new ValidationError(`${field}: caminho de imagem inválido`);
  }
  return { src: img.src, alt: cleanText(img.alt ?? "", LIMITS.alt, `${field} (descrição)`, true) };
}

/** Aplica o que veio do editor sobre o case atual, validando cada campo. */
export function applyEdit(current: CaseData, body: unknown): CaseData {
  if (!body || typeof body !== "object") throw new ValidationError("Conteúdo inválido");
  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.gallery) || b.gallery.length !== current.gallery.length) {
    throw new ValidationError("A galeria não bate com o case atual");
  }
  if (!Array.isArray(b.sections) || b.sections.length !== current.sections.length) {
    throw new ValidationError("As seções não batem com o case atual");
  }

  const gallery = b.gallery.map((img, i) => cleanImage(img, `Imagem ${i + 1} da galeria`));

  if (!Array.isArray(b.bullets) || b.bullets.length > LIMITS.bullets) {
    throw new ValidationError(`Tópicos do card: use até ${LIMITS.bullets}`);
  }
  const bullets = b.bullets.map((t, i) => cleanText(t, LIMITS.short, `Tópico ${i + 1} do card`, true)).filter(Boolean);

  const sections = current.sections.map((sec, i) => {
    const s = (b.sections as unknown[])[i] as Record<string, unknown> | undefined;
    if (!s || s.id !== sec.id) throw new ValidationError("As seções não batem com o case atual");
    if (!Array.isArray(s.paragraphs) || s.paragraphs.length > LIMITS.paragraphs) {
      throw new ValidationError(`${sec.title}: parágrafos inválidos`);
    }
    const paragraphs = s.paragraphs
      .map((p, j) => cleanText(p, LIMITS.long, `${sec.title}, parágrafo ${j + 1}`, true))
      .filter(Boolean);
    if (!paragraphs.length) throw new ValidationError(`${sec.title}: precisa de pelo menos um parágrafo`);
    const next = { id: sec.id, title: cleanText(s.title, LIMITS.short, "Título da seção"), paragraphs };
    return s.image ? { ...next, image: cleanImage(s.image, `Imagem da seção "${next.title}"`) } : next;
  });

  return {
    ...current,
    title: cleanText(b.title, LIMITS.short, "Título"),
    meta: cleanText(b.meta, LIMITS.short, "Linha de contexto"),
    summary: cleanText(b.summary, LIMITS.summary, "Resumo"),
    intro: cleanText(b.intro, LIMITS.long, "Introdução"),
    bullets,
    gallery,
    sections,
  };
}

// ---------- Novo artigo ----------

export function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

const PLACEHOLDER = { src: "/images/placeholder.jpg", alt: "" };
const TODO = "Escreva aqui.";

/** Mesma estrutura dos cases existentes, com textos para substituir. */
function newCase(slug: string, title: string): CaseData {
  const sections: [string, string][] = [
    ["visao-geral", "Visão geral"],
    ["contexto-do-negocio", "Contexto do negócio"],
    ["pesquisa-e-descoberta", "Pesquisa e descoberta"],
    ["decisoes-chave", "Decisões-chave"],
    ["o-que-foi-entregue", "O que foi entregue"],
    ["aprendizados", "Aprendizados"],
  ];
  return {
    slug,
    featured: false,
    meta: "Setor · Tipo de produto · Ano",
    title,
    summary: "Uma frase sobre o problema e o resultado do projeto.",
    bullets: ["Primeiro destaque do projeto", "Segundo destaque do projeto", "Terceiro destaque do projeto"],
    gallery: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
    intro: "Contexto do projeto e qual foi o seu papel como PM.",
    sections: sections.map(([id, t]) => ({ id, title: t, paragraphs: [TODO] })),
  };
}

// ---------- Leitura e gravação (GitHub no site publicado, disco no desenvolvimento) ----------

export function storageMode() {
  if (githubConfig()) return "github" as const;
  if (process.env.NODE_ENV !== "production") return "local" as const;
  return null;
}

async function github(url: string, token: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com${url}`, {
    ...init,
    cache: "no-store",
    headers: { ...githubHeaders(token), ...init?.headers },
  });
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
  return res.json();
}

type Loaded = { data: CasesFile; save: (data: CasesFile, message: string) => Promise<void> };

const serialize = (data: CasesFile) => JSON.stringify(data, null, 2) + "\n";

/** Lê a versão mais recente do arquivo (sem cache) e devolve uma função para gravar por cima dela. */
async function openCases(): Promise<Loaded> {
  const gh = githubConfig();
  if (gh) {
    const url = `/repos/${gh.repo}/contents/${CASES_FILE}`;
    const file = await github(`${url}?ref=${encodeURIComponent(gh.branch)}`, gh.token);
    return {
      data: JSON.parse(Buffer.from(file.content, "base64").toString("utf8")),
      save: async (data, message) => {
        await github(url, gh.token, {
          method: "PUT",
          body: JSON.stringify({
            message,
            content: Buffer.from(serialize(data), "utf8").toString("base64"),
            sha: file.sha, // se alguém salvou no meio tempo, o GitHub recusa em vez de sobrescrever
            branch: gh.branch,
          }),
        });
      },
    };
  }
  if (process.env.NODE_ENV !== "production") {
    const full = path.join(process.cwd(), CASES_FILE);
    return {
      data: JSON.parse(await readFile(full, "utf8")),
      save: (data) => writeFile(full, serialize(data), "utf8"),
    };
  }
  throw new Error("Editor sem destino de gravação configurado");
}

// ---------- Estrutura: seções, ordem, destaques, exclusão ----------

function uniqueSectionId(title: string, sections: { id: string }[]) {
  const base = slugify(title) || "secao";
  let id = base;
  for (let n = 2; sections.some((s) => s.id === id); n++) id = `${base}-${n}`;
  return id;
}

export type SectionOp =
  | { action: "add"; after: number; title: string }
  | { action: "remove"; index: number }
  | { action: "move"; index: number; direction: "up" | "down" };

/** Adiciona, remove ou move uma seção do case. */
export async function changeSections(slug: string, body: unknown) {
  const op = (body ?? {}) as Partial<SectionOp> & Record<string, unknown>;
  const { data, save } = await openCases();
  const c = data.projects.find((p) => p.slug === slug);
  if (!c) throw new ValidationError("Case não encontrado");
  const n = c.sections.length;
  const validIndex = (i: unknown, max: number): i is number => Number.isInteger(i) && (i as number) >= 0 && (i as number) < max;

  if (op.action === "add") {
    if (n >= LIMITS.sections) throw new ValidationError(`Limite de ${LIMITS.sections} seções atingido`);
    if (!(op.after === -1 || validIndex(op.after, n))) throw new ValidationError("Posição inválida");
    const title = cleanText(op.title, LIMITS.short, "Título da seção");
    c.sections.splice((op.after as number) + 1, 0, { id: uniqueSectionId(title, c.sections), title, paragraphs: [TODO] });
  } else if (op.action === "remove") {
    if (!validIndex(op.index, n)) throw new ValidationError("Seção inválida");
    if (n <= 1) throw new ValidationError("O case precisa de pelo menos uma seção");
    c.sections.splice(op.index as number, 1);
  } else if (op.action === "move") {
    if (!validIndex(op.index, n)) throw new ValidationError("Seção inválida");
    const to = (op.index as number) + (op.direction === "up" ? -1 : op.direction === "down" ? 1 : NaN);
    if (!validIndex(to, n)) throw new ValidationError("Não dá para mover para essa posição");
    [c.sections[op.index as number], c.sections[to]] = [c.sections[to], c.sections[op.index as number]];
  } else {
    throw new ValidationError("Ação inválida");
  }
  await save(data, `content: altera seções do case ${slug} pelo editor do site`);
}

/** Define a ordem dos artigos e quais aparecem na home (até 3, na ordem da lista). */
export async function arrangeCases(body: unknown) {
  const b = (body ?? {}) as { order?: unknown; featured?: unknown };
  const { data, save } = await openCases();
  const slugs = data.projects.map((p) => p.slug);
  const order = b.order;
  const featured = b.featured;

  if (!Array.isArray(order) || order.length !== slugs.length || new Set(order).size !== slugs.length || !order.every((s) => slugs.includes(s))) {
    throw new ValidationError("A lista mudou. Recarregue a página e tente de novo.");
  }
  if (!Array.isArray(featured) || !featured.every((s) => slugs.includes(s))) throw new ValidationError("Destaques inválidos");
  if (featured.length > LIMITS.featured) throw new ValidationError(`A home mostra no máximo ${LIMITS.featured} artigos`);
  if (!featured.length) throw new ValidationError("Escolha pelo menos um artigo para a home");

  data.projects = (order as string[]).map((s) => {
    const p = data.projects.find((x) => x.slug === s)!;
    return { ...p, featured: featured.includes(s) };
  });
  await save(data, "content: reorganiza artigos e destaques da home pelo editor do site");
}

export async function deleteCase(slug: string) {
  const { data, save } = await openCases();
  const i = data.projects.findIndex((p) => p.slug === slug);
  if (i < 0) throw new ValidationError("Case não encontrado");
  if (data.projects.length <= 1) throw new ValidationError("O portfólio precisa de pelo menos um artigo");
  const rest = data.projects.filter((p) => p.slug !== slug);
  if (!rest.some((p) => p.featured)) throw new ValidationError("Esse é o único artigo na home. Escolha outro para a home antes de apagar.");
  data.projects = rest;
  await save(data, `content: apaga o case ${slug} pelo editor do site`);
}

export async function listCases() {
  const { data } = await openCases();
  return data.projects.map((p) => ({ slug: p.slug, title: p.title, featured: p.featured }));
}

export async function saveCase(slug: string, body: unknown) {
  const { data, save } = await openCases();
  const i = data.projects.findIndex((p) => p.slug === slug);
  if (i < 0) throw new ValidationError("Case não encontrado");
  data.projects[i] = applyEdit(data.projects[i], body);
  await save(data, `content: atualiza o case ${slug} pelo editor do site`);
}

export async function createCase(rawTitle: unknown) {
  const title = cleanText(rawTitle, LIMITS.short, "Título");
  const base = slugify(title);
  if (!base) throw new ValidationError("Use letras ou números no título");

  const { data, save } = await openCases();
  if (data.projects.length >= LIMITS.cases) throw new ValidationError("Limite de artigos atingido");
  let slug = base;
  for (let n = 2; data.projects.some((p) => p.slug === slug); n++) slug = `${base}-${n}`;

  data.projects.push(newCase(slug, title));
  await save(data, `content: cria o case ${slug} pelo editor do site`);
  return slug;
}

// ---------- Imagens ----------

/** Confere o tipo pelo conteúdo do arquivo, não pelo nome. */
function sniffImage(buf: Buffer) {
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 0, 4) === "GIF8") return "gif";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /^avi[fs]$/.test(buf.toString("ascii", 8, 12))) return "avif";
  return null;
}

/** Grava a imagem em public/images/uploads e devolve o caminho para usar no case. */
export async function uploadImage(file: File, slug: string) {
  if (file.size > MAX_IMAGE_BYTES) throw new ValidationError("Imagem maior que 4 MB. Reduza o tamanho e tente de novo.");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) throw new ValidationError("Formato não aceito. Use JPG, PNG, WebP, AVIF ou GIF.");

  const name = `${slugify(slug) || "case"}-${Date.now()}-${randomBytes(3).toString("hex")}.${ext}`;
  const src = `/images/uploads/${name}`;

  const gh = githubConfig();
  if (gh) {
    await github(`/repos/${gh.repo}/contents/${UPLOADS_DIR}/${name}`, gh.token, {
      method: "PUT",
      body: JSON.stringify({ message: `content: envia imagem ${name} pelo editor do site`, content: buf.toString("base64"), branch: gh.branch }),
    });
  } else if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), UPLOADS_DIR);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buf);
  } else {
    throw new Error("Editor sem destino de gravação configurado");
  }
  return src;
}
