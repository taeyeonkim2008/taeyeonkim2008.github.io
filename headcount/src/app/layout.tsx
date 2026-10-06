import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import DemoBar from "@/components/DemoBar";
import { DemoClockProvider } from "@/lib/demoClock";
import { getProvider } from "@/lib/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Headcount", template: "%s · Headcount" },
  description: "Live, anonymous busyness estimates for campus study spaces, gyms and dining halls — floor by floor.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1114" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <DemoClockProvider enabled={getProvider().isSimulated}>
          <Header />
          <DemoBar />
          <main className="mx-auto w-full max-w-2xl px-4 pb-16">{children}</main>
        </DemoClockProvider>
      </body>
    </html>
  );
}
