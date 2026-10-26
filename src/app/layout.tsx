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
    <html lang="en" className="dark motion-ok" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/original.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion-ok')}}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-[#030409] text-[#e6ebf5] antialiased overflow-x-clip">
        {children}
      </body>
    </html>
  );
}
