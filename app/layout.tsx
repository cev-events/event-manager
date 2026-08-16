// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
import type { Metadata } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://event.cev.ac.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CEV EVENTS | Official Multi-Community Event Platform",
    template: "%s | CEV EVENTS",
  },
  description: "Official multi-community event management, publishing, slot booking, and public discovery platform for College of Engineering Vadakara (CE Vadakara).",
  keywords: [
    "CEV EVENTS",
    "College of Engineering Vadakara",
    "CE Vadakara",
    "Whats @ CEV",
    "Campus Events",
    "Student Communities",
    "Workshop Slot Booking",
    "Tech Communities Vadakara",
    "TinkerHub CEV",
    "IEEE CEV",
  ],
  authors: [{ name: "Shibili Aman TK", url: "https://www.shibili.tech" }],
  creator: "Shibili Aman TK",
  publisher: "College of Engineering Vadakara",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "CEV EVENTS | Multi-Community Event Manager",
    description: "Discover live workshops, hackathons, guest lectures, and student community initiatives at College of Engineering Vadakara.",
    url: siteUrl,
    siteName: "CEV EVENTS",
    images: [
      {
        url: `${siteUrl}/images/web.png`,
        width: 1200,
        height: 630,
        alt: "CEV EVENTS Campus Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CEV EVENTS | Multi-Community Event Manager",
    description: "Unified campus event discovery, slot booking, and community management for CE Vadakara.",
    images: [`${siteUrl}/images/web.png`],
    creator: "@LordSA",
  },
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      'url': siteUrl,
      'name': 'CEV EVENTS',
      'description': 'Official multi-community event management and discovery platform for College of Engineering Vadakara.',
      'publisher': {
        '@type': 'EducationalOrganization',
        'name': 'College of Engineering Vadakara',
        'url': 'https://cev.ac.in',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      'name': 'College of Engineering Vadakara',
      'url': 'https://cev.ac.in',
      'logo': `${siteUrl}/cev_logo.svg`,
      'sameAs': [
        'https://github.com/LordSA',
        'https://www.shibili.tech',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${quera.variable} ${gued.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#08090d] text-[#f8fafc] antialiased overflow-y-auto overflow-x-hidden selection:bg-[#6366f1] selection:text-white font-sans">
        <Analytics />
        <SpeedInsights />
        <LoadingScreen />
        <SmoothScroll />
        <ConditionalNavbar />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  );
}
