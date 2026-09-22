import type { MetadataRoute } from 'next';

const siteUrl = 'https://medi-go-murex.vercel.app';

// Seules les pages publiques (accessibles sans connexion) ont leur place dans le
// sitemap — les pages patient/pharmacie/admin sont derrière une authentification
// et exclues via robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/telecharger`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/connexion`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/inscription`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
