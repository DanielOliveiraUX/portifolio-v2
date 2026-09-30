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

O jeito normal é pelo editor em `/admin` (senha em `ADMIN_PASSWORD`). Ele grava direto nos arquivos abaixo: no GitHub quando o site está publicado (`GITHUB_TOKEN` e `GITHUB_REPO` na Vercel) ou no disco quando roda local.

- **Artigos (cases):** `data/cases.json`. No editor: abra o artigo e clique em "Editar" para mudar textos, imagens, seções, tópicos do card e a animação da capa. Em `/admin`: ordem, destaques da home (até 3), criar e apagar.
- **Textos, imagens e links do site:** `data/site.json`. Em `/admin`, seção "Site": hero (cargo, localização, imagem), seção verde, sobre mim (texto e foto), contato (título, botão de chamada e link, e-mail, LinkedIn, rodapé) e título/descrição para o Google.
- **Animações de capa:** páginas HTML em `public/motion/`. Um arquivo novo nessa pasta aparece na lista do editor depois do push.
- **Imagens enviadas pelo editor:** ficam em `public/images/uploads/`.

## Deploy

1. Suba a pasta para o repositório no GitHub (sem `node_modules` e `.next`, o `.gitignore` já cuida disso).
2. Na Vercel: **Add New → Project → Import** o repositório. O preset Next.js é detectado sozinho. Para o editor funcionar no site publicado, configure `ADMIN_PASSWORD` (12+ caracteres), `GITHUB_TOKEN` (com permissão de escrita em Contents) e `GITHUB_REPO` (`usuario/repositorio`).
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
