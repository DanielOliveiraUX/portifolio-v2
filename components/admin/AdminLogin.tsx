"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import s from "./AdminLogin.module.css";

type CaseItem = { slug: string; title: string; featured: boolean };

export function AdminLogin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cases, setCases] = useState<CaseItem[] | null>(null);
  const [listError, setListError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  // Organização (ordem + destaques) editada localmente até clicar em "Salvar organização".
  const [draft, setDraft] = useState<CaseItem[] | null>(null);
  const [arranging, setArranging] = useState(false);
  const [arrangeMsg, setArrangeMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    setListError("");
    try {
      const res = await fetch("/api/admin/cases", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar os artigos.");
      setCases(data.cases);
      setDraft(data.cases);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Não foi possível carregar os artigos.");
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed) loadCases();
  }, [authed, loadCases]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível entrar.");
      setPassword("");
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível criar o artigo.");
      // Abre o artigo novo direto no editor.
      window.location.href = `/projetos/${data.slug}`;
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Não foi possível criar o artigo.");
      setCreating(false);
    }
  }

  const changed = JSON.stringify(draft) !== JSON.stringify(cases);
  const featuredCount = draft?.filter((c) => c.featured).length ?? 0;

  function move(i: number, dir: -1 | 1) {
    if (!draft) return;
    const next = [...draft];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    setDraft(next);
    setArrangeMsg(null);
  }

  function toggleFeatured(slug: string) {
    if (!draft) return;
    const item = draft.find((c) => c.slug === slug)!;
    if (!item.featured && featuredCount >= 3) {
      setArrangeMsg({ tone: "error", text: "A home mostra no máximo 3 artigos. Tire um antes de colocar outro." });
      return;
    }
    setDraft(draft.map((c) => (c.slug === slug ? { ...c, featured: !c.featured } : c)));
    setArrangeMsg(null);
  }

  async function saveArrangement() {
    if (!draft) return;
    setArranging(true);
    setArrangeMsg(null);
    try {
      const res = await fetch("/api/admin/cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: draft.map((c) => c.slug), featured: draft.filter((c) => c.featured).map((c) => c.slug) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar a organização.");
      setCases(draft);
      setArrangeMsg({ tone: "ok", text: "Organização salva. A home já mostra a nova ordem." });
    } catch (err) {
      setArrangeMsg({ tone: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setArranging(false);
    }
  }

  async function remove(slug: string) {
    setDeleting(slug);
    setArrangeMsg(null);
    try {
      const res = await fetch(`/api/admin/cases/${slug}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível apagar o artigo.");
      setConfirmDelete(null);
      setArrangeMsg({ tone: "ok", text: "Artigo apagado." });
      await loadCases();
    } catch (err) {
      setArrangeMsg({ tone: "error", text: err instanceof Error ? err.message : "Erro ao apagar." });
    } finally {
      setDeleting(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAuthed(false);
    setCases(null);
  }

  return (
    <section className={`container ${s.wrap}`}>
      <h1 className={s.title}>Editor do portfólio</h1>

      {authed === null && <p className={s.muted}>Verificando sessão…</p>}

      {authed === false && (
        <form className={s.form} onSubmit={login}>
          <label className={s.label} htmlFor="admin-password">
            Senha
          </label>
          <input
            id="admin-password"
            className={s.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <button className={s.button} type="submit" disabled={busy || !password}>
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
      )}

      {authed && (
        <div className={s.panel}>
          <div className={s.group}>
            <h2 className={s.label}>Artigos</h2>
            <p className={s.muted}>
              Abra um artigo e clique em &ldquo;Editar&rdquo; na barra do rodapé. Use as setas para ordenar e &ldquo;Home&rdquo; para
              escolher até 3 destaques (na ordem da lista). A sessão dura 8 horas.
            </p>
            {listError && (
              <p className={s.error} role="alert">
                {listError}
              </p>
            )}
            {!draft && !listError && <p className={s.muted}>Carregando…</p>}
            {draft && (
              <ul className={s.list}>
                {draft.map((c, i) => (
                  <li key={c.slug} className={s.row}>
                    <Link href={`/projetos/${c.slug}`} className={s.item} prefetch={false}>
                      <span className={s.tab}>{String(i + 1).padStart(2, "0")}</span>
                      <span>{c.title}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                    <div className={s.tools}>
                      <button type="button" className={s.icon} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir "${c.title}"`}>
                        ↑
                      </button>
                      <button
                        type="button"
                        className={s.icon}
                        onClick={() => move(i, 1)}
                        disabled={i === draft.length - 1}
                        aria-label={`Descer "${c.title}"`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className={c.featured ? s.toggleOn : s.toggle}
                        onClick={() => toggleFeatured(c.slug)}
                        aria-pressed={c.featured}
                      >
                        Home
                      </button>
                      {confirmDelete === c.slug ? (
                        <>
                          <button type="button" className={s.danger} onClick={() => remove(c.slug)} disabled={deleting !== null}>
                            {deleting === c.slug ? "Apagando…" : "Apagar mesmo"}
                          </button>
                          <button type="button" className={s.icon} onClick={() => setConfirmDelete(null)}>
                            Não
                          </button>
                        </>
                      ) : (
                        <button type="button" className={s.icon} onClick={() => setConfirmDelete(c.slug)} disabled={changed}>
                          Apagar
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {arrangeMsg && (
              <p className={arrangeMsg.tone === "error" ? s.error : s.ok} role="status">
                {arrangeMsg.text}
              </p>
            )}
            {changed && (
              <div className={s.row}>
                <button className={s.button} type="button" onClick={saveArrangement} disabled={arranging}>
                  {arranging ? "Salvando…" : "Salvar organização"}
                </button>
                <button className={s.ghost} type="button" onClick={() => setDraft(cases)} disabled={arranging}>
                  Desfazer
                </button>
              </div>
            )}
          </div>

          <form className={s.group} onSubmit={create}>
            <h2 className={s.label}>Novo artigo</h2>
            <p className={s.muted}>
              Cria um case com a mesma estrutura dos outros (seções, galeria e card). Ele aparece em Todos os projetos;
              os três destaques da home não mudam.
            </p>
            <div className={s.row}>
              <input
                className={s.input}
                type="text"
                placeholder="Título do artigo"
                value={newTitle}
                maxLength={200}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <button className={s.button} type="submit" disabled={creating || !newTitle.trim()}>
                {creating ? "Criando…" : "Criar"}
              </button>
            </div>
            {createError && (
              <p className={s.error} role="alert">
                {createError}
              </p>
            )}
          </form>

          <button className={s.ghost} type="button" onClick={logout}>
            Sair do editor
          </button>
        </div>
      )}
    </section>
  );
}
