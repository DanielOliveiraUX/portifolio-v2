"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseImage, SiteData } from "@/lib/content-types";
import s from "./AdminLogin.module.css";

type Status = { tone: "ok" | "error"; text: string } | null;

/** O formulário trabalha com texto corrido; a conversão para o formato do arquivo acontece ao salvar. */
type Form = {
  role: string;
  location: string;
  heroImage: CaseImage;
  about: string;
  bio: string;
  bioImage: CaseImage;
  contactTitle: string;
  ctaLabel: string;
  ctaUrl: string;
  email: string;
  linkedin: string;
  footer: string;
  seoTitle: string;
  seoDescription: string;
};

const splitParagraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

function toForm(site: SiteData): Form {
  return {
    role: site.hero.role,
    location: site.hero.location,
    heroImage: site.hero.image,
    about: site.about.paragraphs.map((lines) => lines.join("\n")).join("\n\n"),
    bio: site.bio.paragraphs.join("\n\n"),
    bioImage: site.bio.image,
    contactTitle: site.contact.title,
    ctaLabel: site.contact.ctaLabel,
    ctaUrl: site.contact.ctaUrl,
    email: site.contact.email,
    linkedin: site.contact.linkedin,
    footer: site.contact.footer,
    seoTitle: site.seo.title,
    seoDescription: site.seo.description,
  };
}

function toSite(f: Form): SiteData {
  return {
    hero: { role: f.role, location: f.location, image: f.heroImage },
    about: { paragraphs: splitParagraphs(f.about).map((p) => p.split("\n").map((l) => l.trim()).filter(Boolean)) },
    bio: { paragraphs: splitParagraphs(f.bio), image: f.bioImage },
    contact: {
      title: f.contactTitle,
      ctaLabel: f.ctaLabel,
      ctaUrl: f.ctaUrl,
      email: f.email,
      linkedin: f.linkedin,
      footer: f.footer,
    },
    seo: { title: f.seoTitle, description: f.seoDescription },
  };
}

/** Textos, links e imagens do site que ficam fora dos cases. */
export function SiteEditor() {
  const [saved, setSaved] = useState<Form | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  // URL para exibir cada imagem, pelo caminho gravado (imagens enviadas só entram no site no próximo deploy)
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/site", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || "Não foi possível carregar os textos do site.");
        const f = toForm(data.site);
        setSaved(f);
        setForm(f);
        setPreviews({ [f.heroImage.src]: data.previews?.heroImage, [f.bioImage.src]: data.previews?.bioImage });
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Não foi possível carregar os textos do site."));
  }, []);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (loadError) {
    return (
      <p className={s.error} role="alert">
        {loadError}
      </p>
    );
  }
  if (!form) return <p className={s.muted}>Carregando…</p>;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm({ ...form, [key]: value });
    setStatus(null);
  };

  async function upload(key: "heroImage" | "bioImage", file: File) {
    setUploading(key);
    setStatus(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slug", "site");
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar a imagem.");
      setForm((f) => f && { ...f, [key]: { ...f[key], src: data.src } });
      setPreviews((p) => ({ ...p, [data.src]: URL.createObjectURL(file) }));
      setStatus({ tone: "ok", text: "Imagem enviada. Clique em Salvar para publicar." });
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error ? err.message : "Erro ao enviar a imagem." });
    } finally {
      setUploading(null);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSite(form)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      setSaved(form);
      setStatus({
        tone: "ok",
        text: data.mode === "github" ? "Salvo e publicado. O site já mostra a versão nova." : "Salvo em data/site.json (modo local).",
      });
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  const text = (key: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      <input
        className={s.input}
        type="text"
        value={form[key] as string}
        maxLength={200}
        required
        onChange={(e) => set(key, e.target.value)}
        {...props}
      />
    </label>
  );

  const area = (key: keyof Form, label: string, hint: string, rows: number, maxLength = 4000) => (
    <label className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      <textarea
        className={`${s.input} ${s.textarea}`}
        value={form[key] as string}
        rows={rows}
        maxLength={maxLength}
        required
        onChange={(e) => set(key, e.target.value)}
      />
      <span className={s.hint}>{hint}</span>
    </label>
  );

  return (
    <form className={s.siteForm} onSubmit={save}>
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Hero (topo da home)</legend>
        {text("role", "Cargo")}
        {text("location", "Localização")}
        <ImageField
          label="Imagem de fundo"
          image={form.heroImage}
          preview={previews[form.heroImage.src]}
          busy={uploading === "heroImage"}
          onFile={(f) => upload("heroImage", f)}
        />
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Seção verde</legend>
        {area(
          "about",
          "Texto",
          "Cada linha vira uma linha no computador. Linha em branco separa parágrafos. Coloque entre **asteriscos** o que deve sair em negrito.",
          8
        )}
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Sobre mim</legend>
        {area("bio", "Texto", "Linha em branco separa parágrafos.", 10)}
        <ImageField
          label="Foto"
          image={form.bioImage}
          preview={previews[form.bioImage.src]}
          busy={uploading === "bioImage"}
          onFile={(f) => upload("bioImage", f)}
          onAlt={(alt) => set("bioImage", { ...form.bioImage, alt })}
        />
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Contato e botão de chamada (CTA)</legend>
        {area("contactTitle", "Título", "Cada linha vira uma linha do título.", 2, 600)}
        {text("ctaLabel", "Texto do botão")}
        {text("ctaUrl", "Link do botão", {
          maxLength: 400,
          placeholder: "https://calendly.com/... ou mailto:voce@email.com",
        })}
        <p className={s.hint}>Aceita link https://, mailto: (abre o e-mail) ou tel:. Links https abrem em nova aba.</p>
        {text("email", "E-mail", { type: "email" })}
        {text("linkedin", "LinkedIn", { type: "url", maxLength: 400 })}
        {text("footer", "Texto do rodapé")}
      </fieldset>

      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Google e redes sociais</legend>
        {text("seoTitle", "Título da página inicial")}
        {area("seoDescription", "Descrição", "Aparece no resultado do Google e ao compartilhar o link.", 3, 600)}
      </fieldset>

      {status && (
        <p className={status.tone === "error" ? s.error : s.ok} role="status">
          {status.text}
        </p>
      )}
      <div className={s.row}>
        <button className={s.button} type="submit" disabled={saving || !dirty || uploading !== null}>
          {saving ? "Salvando…" : "Salvar textos do site"}
        </button>
        {dirty && (
          <button className={s.ghost} type="button" onClick={() => setForm(saved)} disabled={saving}>
            Desfazer
          </button>
        )}
      </div>
    </form>
  );
}

function ImageField({
  label,
  image,
  preview,
  busy,
  onFile,
  onAlt,
}: {
  label: string;
  image: CaseImage;
  preview?: string;
  busy: boolean;
  onFile: (f: File) => void;
  onAlt?: (alt: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={s.field}>
      <span className={s.fieldLabel}>{label}</span>
      <div className={s.imageField}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.imagePreview} src={preview ?? image.src} alt="" />
        <div className={s.imageActions}>
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
          />
          <button type="button" className={s.ghost} onClick={() => input.current?.click()} disabled={busy}>
            {busy ? "Enviando…" : "Trocar imagem"}
          </button>
          <span className={s.hint}>JPG, PNG, WebP ou AVIF até 4 MB.</span>
          {onAlt && (
            <input
              className={s.input}
              type="text"
              value={image.alt}
              maxLength={300}
              placeholder="Descrição da imagem (acessibilidade)"
              onChange={(e) => onAlt(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
