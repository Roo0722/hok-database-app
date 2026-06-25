import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Honor of Kings Database — Heroes, Items, Arcana & Patches",
  description:
    "Browse all heroes, items, arcana and patches from Honor of Kings Global. Complete database with live news scraping from the official HoK website.",
  keywords: [
    "Honor of Kings",
    "HoK",
    "heroes",
    "items",
    "arcana",
    "patches",
    "database",
    "tier list",
  ],
  icons: {
    icon: [
      { url: "/hok-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/hok-icon.png", sizes: "192x192", type: "image/png" },
      { url: "/hok-favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/hok-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Honor of Kings Database",
    description: "Complete HoK Global Database with Live News",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "#0D0D0D",
          color: "#F0F0F0",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
