import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: "MediGo - Votre santé au Togo",
  description: "ERP Pharmaceutique - Recherche de médicaments et pharmacies de garde",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediGo",
  },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" translate="no">
      <body className="antialiased">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        {children}
        <Analytics />
      </body>
    </html>
  );
}