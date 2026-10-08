import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PixelForge",
    short_name: "PixelForge",
    description: "Restore, enhance, and upscale images and video with honest labels.",
    start_url: "/overview",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F8F7F2",
    theme_color: "#7357D8",
    categories: ["photo", "productivity", "utilities"],
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
