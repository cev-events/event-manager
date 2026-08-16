// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/client';
import { getValidSiteUrl } from '@/lib/siteUrl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getValidSiteUrl();
  const supabase = createClient();

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const { data: events } = await supabase
      .from('events')
      .select('id, slug, updated_at, created_at')
      .eq('status', 'live');

    if (events) {
      events.forEach((evt) => {
        routes.push({
          url: `${baseUrl}/events/${evt.slug || evt.id}`,
          lastModified: evt.updated_at ? new Date(evt.updated_at) : new Date(evt.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    const { data: communities } = await supabase
      .from('communities')
      .select('id, slug, updated_at, created_at')
      .neq('slug', 'college');

    if (communities) {
      communities.forEach((comm) => {
        routes.push({
          url: `${baseUrl}/community/${comm.slug || comm.id}`,
          lastModified: comm.updated_at ? new Date(comm.updated_at) : new Date(comm.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch {
    // Graceful fallback
  }

  return routes;
}
