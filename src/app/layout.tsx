import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TESTARIO — Prepara Guardia Civil y Policía Nacional con tu propio temario",
  description:
    "Sube tu temario en PDF y genera tests de autoevaluación con preguntas ancladas a tu propio material, con fuente citada en cada corrección.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4338ca",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
