import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { FlairButtons } from "@/components/FlairButtons";
import { getSite } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSite();
  return {
    title: {
      default: seo.title,
      template: "%s · Daniel Oliveira",
    },
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      locale: "pt_BR",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#060606",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { contact } = await getSite();
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="sr-only">
          Pular para o conteúdo
        </a>
        <Header email={contact.email} linkedin={contact.linkedin} />
        <main id="conteudo">{children}</main>
        <FlairButtons />
      </body>
    </html>
  );
}
