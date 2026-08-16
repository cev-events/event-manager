// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
import { MetadataRoute } from 'next';
import { getValidSiteUrl } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getValidSiteUrl();

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
