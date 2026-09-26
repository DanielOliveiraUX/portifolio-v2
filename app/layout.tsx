import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { VelocityBlur } from "@/components/VelocityBlur";
import { FlairButtons } from "@/components/FlairButtons";

export const metadata: Metadata = {
  title: {
    default: "Daniel Oliveira · Product Manager",
    template: "%s · Daniel Oliveira",
  },
  description:
    "Portfólio de Daniel Oliveira, Product Manager no Rio de Janeiro. Projetos, forma de trabalho e contato.",
  openGraph: {
    title: "Daniel Oliveira · Product Manager",
    description: "Portfólio de Daniel Oliveira, Product Manager no Rio de Janeiro.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060606",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="sr-only">
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo">{children}</main>
        <VelocityBlur />
        <FlairButtons />
      </body>
    </html>
  );
}
