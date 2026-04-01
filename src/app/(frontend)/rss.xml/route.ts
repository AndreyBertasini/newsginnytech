import { getPayload } from 'payload'
import config from '@/payload.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://news.ginnytech.it'

export async function GET() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 50,
    depth: 0,
  })

  const items = docs
    .map((item) => {
      const pubDate = item.publishedAt
        ? new Date(item.publishedAt).toUTCString()
        : new Date(item.createdAt).toUTCString()
      const excerpt = item.excerpt
        ? item.excerpt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : ''
      const title = item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `
    <item>
      <title>${title}</title>
      <link>${SITE_URL}/news/${item.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/news/${item.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      ${item.category ? `<category>${item.category}</category>` : ''}
      ${excerpt ? `<description>${excerpt}</description>` : ''}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GinnyTech News</title>
    <link>${SITE_URL}/news</link>
    <description>Le ultime news su MarTech, Analytics e Marketing Digitale da GinnyTech.</description>
    <language>it</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://ginnytech.it/ginni.png</url>
      <title>GinnyTech News</title>
      <link>${SITE_URL}/news</link>
    </image>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
