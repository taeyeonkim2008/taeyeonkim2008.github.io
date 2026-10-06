import type { MetadataRoute } from "next";

// Web app manifest — lets phones install Headcount to the home screen and open
// it full-screen. Served by Next.js at /manifest.webmanifest and linked automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Headcount",
    short_name: "Headcount",
    description: "How busy campus study spaces, gyms and dining halls are — floor by floor.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f5f1",
    theme_color: "#f6f5f1",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
