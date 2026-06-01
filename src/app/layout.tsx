import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ours Begins Before We've Even Met | An Interactive Story",
  description: "A cinematic, emotionally immersive storytelling website inspired by a heartfelt love letter to a future partner. Experience a buttery smooth, interactive journey.",
  keywords: ["love letter", "storytelling", "interactive website", "awwwards", "future partner", "cinematic experience"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
