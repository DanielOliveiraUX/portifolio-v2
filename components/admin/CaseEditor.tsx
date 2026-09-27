"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import s from "./CaseEditor.module.css";

type Status = { tone: "ok" | "error" | "info"; text: string } | null;

/**
 * Barra do editor nas páginas de case. Só aparece para quem entrou em /admin.
 * Os textos editáveis são os elementos com data-edit na página.
 */
export function CaseEditor({ slug, sections }: { slug: string; sections: { id: string; paragraphs: number }[] }) {
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState<"github" | "local" | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const originals = useRef(new Map<HTMLElement, string>());

  const fields = () => Array.from(document.querySelectorAll<HTMLElement>("[data-edit]"));

  // Checa a sessão só se o navegador tiver o cookie-aviso (visitantes comuns não fazem requisição).
  useEffect(() => {
    if (!document.cookie.split("; ").includes("admin_hint=1")) return;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setAuthed(Boolean(d.authenticated));
        setMode(d.mode ?? null);
      })
      .catch(() => {});
  }, []);

  // Liga/desliga a edição direto nos textos da página.
  useEffect(() => {
    if (!editing) return;
    const els = fields();
    originals.current = new Map(els.map((el) => [el, el.innerText]));
    const onInput = (e: Event) => {
      setDirty(true);
      const el = e.currentTarget as HTMLElement;
      if (el.dataset.edit === "title") {
        document.querySelectorAll<HTMLElement>('[data-edit-mirror="title"]').forEach((m) => (m.textContent = el.innerText));
      }
    };
    els.forEach((el) => {
      el.setAttribute("contenteditable", "plaintext-only");
      el.classList.add(s.editable);
      el.addEventListener("input", onInput);
    });
    return () =>
      els.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.classList.remove(s.editable);
        el.removeEventListener("input", onInput);
      });
  }, [editing]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const read = (key: string) => document.querySelector<HTMLElement>(`[data-edit="${key}"]`)?.innerText ?? "";

  const save = useCallback(async () => {
    // Uma linha em branco dentro de um parágrafo vira um parágrafo novo; texto apagado some.
    const payload = {
      title: read("title"),
      meta: read("meta"),
      summary: read("summary"),
      intro: read("intro"),
      sections: sections.map((sec, i) => ({
        id: sec.id,
        title: read(`sections.${i}.title`),
        paragraphs: Array.from({ length: sec.paragraphs }, (_, j) => read(`sections.${i}.paragraphs.${j}`))
          .flatMap((p) => p.split(/\n\s*\n/))
          .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
          .filter(Boolean),
      })),
    };

    setSaving(true);
    setStatus({ tone: "info", text: "Salvando…" });
    try {
      const res = await fetch(`/api/admin/cases/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      setDirty(false);
      setEditing(false);
      setStatus({
        tone: "ok",
        text:
          data.mode === "github"
            ? "Salvo! O site publicado atualiza em cerca de 1 minuto."
            : "Salvo em data/cases.json (modo local).",
      });
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }, [slug, sections]);

  const cancel = () => {
    originals.current.forEach((text, el) => (el.innerText = text));
    const title = originals.current.get(document.querySelector<HTMLElement>('[data-edit="title"]')!);
    if (title) document.querySelectorAll<HTMLElement>('[data-edit-mirror="title"]').forEach((m) => (m.textContent = title));
    setDirty(false);
    setEditing(false);
    setStatus(null);
  };

  const logout = async () => {
    if (dirty) cancel();
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAuthed(false);
  };

  if (!authed) return null;

  return (
    <div className={s.bar} role="region" aria-label="Editor do case">
      {status && (
        <p className={s.status} data-tone={status.tone} role="status">
          {status.text}
        </p>
      )}
      <div className={s.actions}>
        {editing ? (
          <>
            <span className={s.hint}>Clique em qualquer texto para editar</span>
            <button type="button" className={s.ghost} onClick={cancel} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className={s.primary} onClick={save} disabled={saving || !dirty}>
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </>
        ) : (
          <>
            {mode === null && <span className={s.hint}>Gravação não configurada no servidor</span>}
            <button type="button" className={s.primary} onClick={() => { setStatus(null); setEditing(true); }} disabled={mode === null}>
              Editar textos
            </button>
            <button type="button" className={s.ghost} onClick={logout}>
              Sair
            </button>
          </>
        )}
      </div>
    </div>
  );
}
