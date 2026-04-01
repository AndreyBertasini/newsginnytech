import { getPayload } from 'payload'
import type { MetadataRoute } from 'next'
import config from '@/payload.config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
  })

  const newsUrls: MetadataRoute.Sitemap = docs.map((item) => ({
    url: `https://news.ginnytech.it/news/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://news.ginnytech.it/news',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...newsUrls,
  ]
}
