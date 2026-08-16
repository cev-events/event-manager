// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://event.cev.ac.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
