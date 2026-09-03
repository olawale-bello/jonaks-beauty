import type { Metadata } from "next";
import "./globals.css";
import { SiteMotion } from "./components/SiteMotion";
import { homeIntroBootstrap } from "../lib/home-intro.js";

export const metadata: Metadata = {
  metadataBase: new URL("https://jonaks-beauty-premium.dejigraphicz.chatgpt.site"),
  title: "Jonaks Beauty — Luxury Bridal Makeup Artist · Europe",
  description: "Luxury bridal and occasion makeup artistry across Europe. Where your vision becomes art.",
  openGraph: {
    title: "Jonaks Beauty — Luxury Bridal Makeup Artist · Europe",
    description: "Luxury bridal and occasion makeup artistry across Europe. Where your vision becomes art.",
    images: [{ url: "/og.png", alt: "Jonaks Beauty — Luxury Bridal Makeup · Europe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jonaks Beauty — Luxury Bridal Makeup Artist · Europe",
    description: "Luxury bridal and occasion makeup artistry across Europe. Where your vision becomes art.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: homeIntroBootstrap }} /></head>
      <body className="antialiased"><SiteMotion />{children}</body>
    </html>
  );
}
