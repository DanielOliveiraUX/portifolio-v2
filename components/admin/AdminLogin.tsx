"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import s from "./AdminLogin.module.css";

type Case = { slug: string; title: string; tab: string };

export function AdminLogin({ cases }: { cases: Case[] }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

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

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setAuthed(false);
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
          <p className={s.muted}>
            Abra um case e use a barra &ldquo;Editar textos&rdquo; no rodapé da página. A sessão dura 8 horas.
          </p>
          <ul className={s.list}>
            {cases.map((c) => (
              <li key={c.slug}>
                <Link href={`/projetos/${c.slug}`} className={s.item}>
                  <span className={s.tab}>{c.tab}</span>
                  <span>{c.title}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <button className={s.ghost} type="button" onClick={logout}>
            Sair
          </button>
        </div>
      )}
    </section>
  );
}
