"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CaseData, CaseImage } from "@/lib/content-types";
import s from "./CaseEditor.module.css";

type Status = { tone: "ok" | "error" | "info"; text: string } | null;
type ImageState = { img?: CaseImage; preview?: string };

const FLASH_KEY = "admin-flash";
/** Volta direto ao modo edição depois de mudar a estrutura. */
const EDIT_KEY = "admin-keep-editing";

/**
 * Editor das páginas de case. Só aparece para quem entrou em /admin.
 * Textos: elementos com data-edit. Imagens: data-edit-image (galeria e seções).
 */
export function CaseEditor({ initial }: { initial: CaseData }) {
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState<"github" | "local" | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [images, setImages] = useState<Record<string, ImageState>>(() => initialImages(initial));
  const [uploading, setUploading] = useState<string | null>(null);
  const [bullets, setBullets] = useState<string[]>(initial.bullets);
  const [structBusy, setStructBusy] = useState(false);

  // Checa a sessão só se o navegador tiver o cookie-aviso (visitantes comuns não fazem requisição).
  useEffect(() => {
    const flash = sessionStorage.getItem(FLASH_KEY);
    if (flash) {
      sessionStorage.removeItem(FLASH_KEY);
      setStatus({ tone: "ok", text: flash });
    }
    if (!document.cookie.split("; ").includes("admin_hint=1")) return;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setAuthed(Boolean(d.authenticated));
        setMode(d.mode ?? null);
        if (d.authenticated && sessionStorage.getItem(EDIT_KEY)) setEditing(true);
        sessionStorage.removeItem(EDIT_KEY);
      })
      .catch(() => {});
  }, []);

  // Liga a edição direto nos textos da página.
  useEffect(() => {
    if (!editing) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-edit]"));
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

  // Avisa antes de sair com alterações não salvas (desligado quando nós mesmos recarregamos).
  const leaving = useRef(false);
  const reload = () => {
    leaving.current = true;
    window.location.reload();
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (!leaving.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setImage = (key: string, next: ImageState) => {
    setImages((prev) => ({ ...prev, [key]: next }));
    setDirty(true);
  };

  async function upload(key: string, file: File) {
    setUploading(key);
    setStatus({ tone: "info", text: "Enviando imagem…" });
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", initial.slug);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar a imagem.");
      setImage(key, { img: { src: data.src, alt: images[key]?.img?.alt ?? "" }, preview: URL.createObjectURL(file) });
      setStatus({ tone: "info", text: "Imagem enviada. Clique em Salvar para publicar." });
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error ? err.message : "Erro ao enviar a imagem." });
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    const read = (key: string) => document.querySelector<HTMLElement>(`[data-edit="${key}"]`)?.innerText ?? "";
    // Linha em branco dentro de um parágrafo cria um parágrafo novo; texto apagado some.
    const payload = {
      title: read("title"),
      meta: read("meta"),
      summary: read("summary"),
      intro: read("intro"),
      bullets: bullets.map((b) => b.trim()).filter(Boolean),
      gallery: initial.gallery.map((_, i) => images[`gallery.${i}`].img),
      sections: initial.sections.map((sec, i) => ({
        id: sec.id,
        title: read(`sections.${i}.title`),
        paragraphs: sec.paragraphs
          .map((_, j) => read(`sections.${i}.paragraphs.${j}`))
          .flatMap((p) => p.split(/\n\s*\n/))
          .map((p) => p.trim())
          .filter(Boolean),
        ...(images[`sections.${i}`]?.img ? { image: images[`sections.${i}`].img } : {}),
      })),
    };

    setSaving(true);
    setStatus({ tone: "info", text: "Salvando…" });
    try {
      const res = await fetch(`/api/admin/cases/${initial.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      setDirty(false);
      // Recarrega para mostrar a versão que ficou gravada.
      sessionStorage.setItem(
        FLASH_KEY,
        data.mode === "github" ? "Salvo e publicado. Esta é a versão gravada." : "Salvo em data/cases.json (modo local)."
      );
      reload();
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
      setSaving(false);
    }
  }

  /** Mudanças de estrutura (seções) são gravadas na hora e recarregam a página. */
  async function changeSections(op: Record<string, unknown>, done: string) {
    if (dirty) {
      setStatus({ tone: "error", text: "Salve ou cancele as alterações de texto antes de mudar as seções." });
      return;
    }
    setStructBusy(true);
    setStatus({ tone: "info", text: "Atualizando seções…" });
    try {
      const res = await fetch(`/api/admin/cases/${initial.slug}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(op),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível alterar as seções.");
      sessionStorage.setItem(FLASH_KEY, done);
      sessionStorage.setItem(EDIT_KEY, "1");
      reload();
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error ? err.message : "Erro ao alterar as seções." });
      setStructBusy(false);
    }
  }

  const cancel = () => {
    setDirty(false);
    reload();
  };

  if (!authed) return null;

  return (
    <>
      {editing && (
        <CardBullets
          bullets={bullets}
          onChange={(next) => {
            setBullets(next);
            setDirty(true);
          }}
        />
      )}

      {editing &&
        initial.sections.map((sec, i) => (
          <SectionControls
            key={sec.id}
            index={i}
            title={sec.title}
            total={initial.sections.length}
            busy={structBusy}
            onMove={(direction) => changeSections({ action: "move", index: i, direction }, "Seção movida.")}
            onRemove={() => changeSections({ action: "remove", index: i }, `Seção "${sec.title}" removida.`)}
            onAdd={(title) => changeSections({ action: "add", after: i, title }, `Seção "${title}" adicionada.`)}
          />
        ))}

      {editing &&
        Object.keys(images).map((key) => (
          <ImageControl
            key={key}
            id={key}
            state={images[key]}
            removable={key.startsWith("sections.")}
            busy={uploading === key}
            onFile={(f) => upload(key, f)}
            onAlt={(alt) => setImage(key, { ...images[key], img: images[key].img && { ...images[key].img!, alt } })}
            onRemove={() => setImage(key, {})}
          />
        ))}

      <div className={s.bar} role="region" aria-label="Editor do case">
        {status && (
          <p className={s.status} data-tone={status.tone} role="status">
            {status.text}
          </p>
        )}
        <div className={s.actions}>
          {editing ? (
            <>
              <span className={s.hint}>Clique nos textos ou use os botões nas imagens</span>
              <button type="button" className={s.ghost} onClick={cancel} disabled={saving}>
                Cancelar
              </button>
              <button type="button" className={s.primary} onClick={save} disabled={saving || !dirty || uploading !== null}>
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </>
          ) : (
            <>
              {mode === null && <span className={s.hint}>Gravação não configurada no servidor</span>}
              <button
                type="button"
                className={s.primary}
                onClick={() => {
                  setStatus(null);
                  setEditing(true);
                }}
                disabled={mode === null}
              >
                Editar
              </button>
              <Link href="/admin" className={s.ghost}>
                Voltar
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function initialImages(c: CaseData) {
  const map: Record<string, ImageState> = {};
  c.gallery.forEach((img, i) => (map[`gallery.${i}`] = { img }));
  c.sections.forEach((sec, i) => (map[`sections.${i}`] = { img: sec.image }));
  return map;
}

/** Controles de uma imagem, colocados dentro da própria imagem na página. */
function ImageControl({
  id,
  state,
  removable,
  busy,
  onFile,
  onAlt,
  onRemove,
}: {
  id: string;
  state: ImageState;
  removable: boolean;
  busy: boolean;
  onFile: (f: File) => void;
  onAlt: (alt: string) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [targets, setTargets] = useState<{ shot: HTMLElement | null; slot: HTMLElement | null }>({ shot: null, slot: null });

  useEffect(() => {
    setTargets({
      shot: document.querySelector<HTMLElement>(`[data-edit-image="${id}"]`),
      slot: document.querySelector<HTMLElement>(`[data-edit-image-slot="${id}"]`),
    });
  }, [id]);

  // Reflete a troca/remoção na imagem que já está na página.
  useEffect(() => {
    const { shot } = targets;
    if (!shot) return;
    shot.hidden = !state.img;
    const img = shot.querySelector("img");
    if (img && state.preview) {
      img.removeAttribute("srcset");
      img.src = state.preview;
    }
    if (img && state.img) img.alt = state.img.alt;
  }, [targets, state]);

  const picker = (
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
  );

  const controls = (
    <div className={s.imageControls}>
      {picker}
      <button type="button" className={s.primary} onClick={() => input.current?.click()} disabled={busy}>
        {busy ? "Enviando…" : state.img ? "Trocar imagem" : "Adicionar imagem"}
      </button>
      {state.img && (
        <input
          className={s.altInput}
          type="text"
          placeholder="Descrição da imagem (acessibilidade)"
          value={state.img.alt}
          maxLength={300}
          onChange={(e) => onAlt(e.target.value)}
        />
      )}
      {removable && state.img && (
        <button type="button" className={s.ghost} onClick={onRemove}>
          Remover
        </button>
      )}
    </div>
  );

  // Imagem que já existia na página: controles por cima dela.
  if (targets.shot && state.img) return createPortal(<div className={s.imageOverlay}>{controls}</div>, targets.shot);

  // Seção sem imagem (ou imagem nova numa seção que não tinha): bloco próprio na vaga.
  if (targets.slot) {
    return createPortal(
      <div className={s.imageSlot}>
        {state.img && state.preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={s.slotPreview} src={state.preview} alt={state.img.alt} />
        )}
        {controls}
      </div>,
      targets.slot
    );
  }
  return null;
}

/** Painel com os tópicos que aparecem no card da home. */
function CardBullets({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setSlot(document.querySelector<HTMLElement>("[data-edit-card-slot]")), []);
  if (!slot) return null;

  return createPortal(
    <div className={s.panel}>
      <p className={s.panelTitle}>Tópicos do card na home</p>
      {bullets.map((b, i) => (
        <div key={i} className={s.panelRow}>
          <input
            className={s.altInput}
            type="text"
            value={b}
            maxLength={200}
            placeholder={`Tópico ${i + 1}`}
            onChange={(e) => onChange(bullets.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button type="button" className={s.ghost} onClick={() => onChange(bullets.filter((_, j) => j !== i))}>
            Remover
          </button>
        </div>
      ))}
      {bullets.length < 6 && (
        <button type="button" className={s.ghost} onClick={() => onChange([...bullets, ""])}>
          + Adicionar tópico
        </button>
      )}
    </div>,
    slot
  );
}

/** Mover, remover e adicionar seções. */
function SectionControls({
  index,
  title,
  total,
  busy,
  onMove,
  onRemove,
  onAdd,
}: {
  index: number;
  title: string;
  total: number;
  busy: boolean;
  onMove: (d: "up" | "down") => void;
  onRemove: () => void;
  onAdd: (title: string) => void;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  useEffect(() => setSlot(document.querySelector<HTMLElement>(`[data-edit-section-slot="${index}"]`)), [index]);
  if (!slot) return null;

  return createPortal(
    <div className={s.panel}>
      <div className={s.panelRow}>
        <span className={s.panelTitle}>Seção {index + 1}</span>
        <button
          type="button"
          className={s.ghost}
          onClick={() => onMove("up")}
          disabled={busy || index === 0}
          aria-label={`Mover "${title}" para cima`}
        >
          ↑
        </button>
        <button
          type="button"
          className={s.ghost}
          onClick={() => onMove("down")}
          disabled={busy || index === total - 1}
          aria-label={`Mover "${title}" para baixo`}
        >
          ↓
        </button>
        {confirming ? (
          <>
            <button type="button" className={s.danger} onClick={onRemove} disabled={busy}>
              Confirmar remoção
            </button>
            <button type="button" className={s.ghost} onClick={() => setConfirming(false)}>
              Manter
            </button>
          </>
        ) : (
          <button type="button" className={s.ghost} onClick={() => setConfirming(true)} disabled={busy || total <= 1}>
            Remover seção
          </button>
        )}
        <button type="button" className={s.ghost} onClick={() => setAdding((v) => !v)} disabled={busy}>
          + Seção abaixo
        </button>
      </div>
      {adding && (
        <form
          className={s.panelRow}
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim()) onAdd(newTitle.trim());
          }}
        >
          <input
            className={s.altInput}
            type="text"
            value={newTitle}
            maxLength={200}
            placeholder="Título da nova seção"
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <button type="submit" className={s.primary} disabled={busy || !newTitle.trim()}>
            Adicionar
          </button>
        </form>
      )}
    </div>,
    slot
  );
}
