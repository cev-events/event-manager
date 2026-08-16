// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import ConditionalNavbar from "./components/ConNav";
import ConditionalFooter from "./components/ConFooter";

import LoadingScreen from "./components/LoadingScreen";

const quera = localFont({
  src: "../fonts/quera.otf",
  variable: "--font-quera",
  display: "swap",
});

const gued = localFont({
  src: "../fonts/gued.otf",
  variable: "--font-gued",
  display: "swap",
});

const roundered = localFont({
  src: "../fonts/roundered.ttf",
  variable: "--font-roundered",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CEV EVENTS | Multi-Community Event Manager",
  description: "Unified campus event discovery, slot booking, and community management.",
  icons: {
    icon: [
      {
        url: "/icon_w.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon_b.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/icon_w.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon_b.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quera.variable} ${gued.variable}`}>
      <body className="bg-[#08090d] text-[#f8fafc] antialiased overflow-y-auto overflow-x-hidden selection:bg-[#6366f1] selection:text-white font-sans">
        <LoadingScreen />
        <SmoothScroll />
        <ConditionalNavbar />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}
