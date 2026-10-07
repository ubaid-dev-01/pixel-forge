import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-actual",
  display: "swap",
});

const display = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-actual",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-actual",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PixelForge — restore images & video",
    template: "%s — PixelForge",
  },
  description:
    "Professional image infrastructure for people who care about visual quality. Restore, enhance, upscale, sharpen, and transform.",
  applicationName: "PixelForge",
  keywords: [
    "image upscaler",
    "photo restoration",
    "background remover",
    "face restoration",
    "video enhancement",
    "PixelForge",
  ],
  icons: { icon: "/brand/favicon.svg", apple: "/brand/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "PixelForge",
    title: "PixelForge — restore images & video",
    description:
      "Professional image infrastructure for people who care about visual quality.",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "PixelForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PixelForge — restore images & video",
    description: "Professional image infrastructure for people who care about visual quality.",
    images: ["/brand/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const convexConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const tree = convexConfigured ? (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  ) : (
    children
  );

  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className={`${sans.className} antialiased`}>{tree}</body>
    </html>
  );
}
