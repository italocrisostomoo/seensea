import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { Providers } from "./providers";

// Archivo: grotesca sóbria com eixo de largura. Larga e pesada nos títulos, normal no texto.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: "SeenSea", template: "%s · SeenSea" },
  description: "Filmes disponíveis nos streamings por assinatura no Brasil.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink text-fg">
        <Providers>
          <Nav />
          <div className="flex min-h-full flex-1 flex-col md:pl-(--rail)">
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
