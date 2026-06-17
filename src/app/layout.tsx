import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreshMart | Premium E-Commerce Experience",
  description: "Discover our curated collection of premium products designed for the modern individual.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FreshMart",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "FreshMart | Premium E-Commerce Experience",
    description: "Discover our curated collection of premium products designed for the modern individual.",
    siteName: "FreshMart",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreshMart",
    description: "Premium e-commerce experience for modern individuals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <Providers>
          <Header />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
