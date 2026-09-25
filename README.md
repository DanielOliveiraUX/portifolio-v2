# Portfólio 2026 · Daniel Oliveira

Next.js (App Router) + CSS Modules. Páginas estáticas, prontas para a Vercel.

## Rodar local

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Home: hero, seção verde, 3 projetos em destaque, sobre mim, contato |
| `/projetos` | Lista com todos os projetos |
| `/projetos/[slug]` | Página de case (frame "detalhe do projeto") |

## Onde editar o conteúdo

- **Projetos:** `data/projects.ts`. Cada item vira um card e uma página de case. `featured: true` coloca o projeto na Home (máximo 3). As seções do case e o índice lateral são gerados a partir de `sections`.
- **Textos da Home, contato e links:** `data/site.ts`.
- **Link de agendamento:** `site.scheduleUrl` em `data/site.ts`. Hoje abre um e-mail; troque pelo link da ferramenta quando definir.
- **Imagens:** coloque os arquivos em `public/images/` e troque os caminhos em `data/`. Hoje todas usam `placeholder.jpg`. Para ter a imagem atual do Figma, exporte o layer "image 16" e salve por cima de `public/images/placeholder.jpg`.

## Deploy

1. Suba a pasta para o repositório no GitHub (sem `node_modules` e `.next`, o `.gitignore` já cuida disso).
2. Na Vercel: **Add New → Project → Import** o repositório. O preset Next.js é detectado sozinho; não precisa de variável de ambiente.
3. Cada push na branch principal gera um deploy de produção; outras branches geram preview.

## Animações (GSAP)

`gsap` e `@gsap/react` já estão instalados. Padrão sugerido para quando formos animar:

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.from(ref.current, { y: 40, opacity: 0, scrollTrigger: { trigger: ref.current, start: "top 80%" } });
  }, { scope: ref });
  return <div ref={ref}>{children}</div>;
}
```

Respeite `prefers-reduced-motion` (use `gsap.matchMedia()`).
