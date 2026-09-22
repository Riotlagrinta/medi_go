import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import { Analytics } from '@vercel/analytics/next';

const siteUrl = "https://medi-go-murex.vercel.app";
const title = "MediGo - Votre santé au Togo";
const description = "Localisez les pharmacies de garde, vérifiez la disponibilité de vos médicaments et réservez en temps réel au Togo.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediGo",
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "MediGo",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  // Pas de maximumScale/userScalable à false : bloquer le pinch-to-zoom nuit à
  // l'accessibilité (WCAG 1.4.4) pour les utilisateurs malvoyants.
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