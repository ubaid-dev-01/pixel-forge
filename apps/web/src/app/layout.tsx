import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-actual",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7357D8" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1630" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
  icons: {
    icon: [
      { url: "/brand/favicon.svg" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/icon-192.png", sizes: "192x192" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PixelForge",
  },
  formatDetection: {
    telephone: false,
  },
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
    <html lang="en" className={mono.variable}>
      <body className="font-sans antialiased">
        {tree}
        <PwaProvider />
      </body>
    </html>
  );
}
