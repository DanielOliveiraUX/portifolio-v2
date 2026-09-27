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

  const loadCases = useCallback(async () => {
    setListError("");
    try {
      const res = await fetch("/api/admin/cases", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível carregar os artigos.");
      setCases(data.cases);
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
            <p className={s.muted}>Abra um artigo e clique em &ldquo;Editar&rdquo; na barra do rodapé. A sessão dura 8 horas.</p>
            {listError && (
              <p className={s.error} role="alert">
                {listError}
              </p>
            )}
            {!cases && !listError && <p className={s.muted}>Carregando…</p>}
            {cases && (
              <ul className={s.list}>
                {cases.map((c, i) => (
                  <li key={c.slug}>
                    <Link href={`/projetos/${c.slug}`} className={s.item} prefetch={false}>
                      <span className={s.tab}>{String(i + 1).padStart(2, "0")}</span>
                      <span>{c.title}</span>
                      {c.featured && <span className={s.badge}>Na home</span>}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
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
