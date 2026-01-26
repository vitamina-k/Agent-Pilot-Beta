import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
