import type { Metadata, Viewport } from "next";
import { portfolioConfig } from "@/config/portfolio.config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${portfolioConfig.personal.name} — ${portfolioConfig.personal.title}`,
  description: portfolioConfig.personal.tagline,
};

export const viewport: Viewport = {
  themeColor: "#030409",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="/original.css" />
      </head>
      <body className="bg-[#030409] text-[#e6ebf5] antialiased overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
