import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/super-admin/', '/profil', '/commandes', '/paiement', '/livreur'],
      },
    ],
    sitemap: 'https://medi-go-murex.vercel.app/sitemap.xml',
  };
}
