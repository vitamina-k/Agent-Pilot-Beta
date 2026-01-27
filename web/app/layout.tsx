import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Pilot - Tu asistente de IA con múltiples cerebros",
  description: "Genera contenido personalizado con el Consejo de Sabios: múltiples IAs trabajando en consenso para ti.",
  keywords: ["AI", "IA", "Telegram bot", "content generation", "social media"],
  authors: [{ name: "Agent Pilot" }],
  openGraph: {
    title: "Agent Pilot",
    description: "Múltiples IAs trabajando en consenso para ti",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
