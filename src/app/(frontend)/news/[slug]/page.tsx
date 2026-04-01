import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import config from '@/payload.config'
import type { News, Media } from '@/payload-types'
import { RichText } from '@/components/RichText'

export const revalidate = 60

const CATEGORY_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  tecnologia: 'Tecnologia',
  analytics: 'Analytics',
  ecommerce: 'E-commerce',
  seo: 'SEO',
  'social-media': 'Social Media',
  altro: 'Altro',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

function getCover(coverImage: News['coverImage']): { url: string; alt: string } | null {
  if (!coverImage || typeof coverImage === 'number') return null
  const media = coverImage as Media
  if (!media.url) return null
  return { url: media.url, alt: media.alt ?? '' }
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 0,
  })

  const item = docs[0]
  if (!item) return { title: 'Articolo non trovato — GinnyTech' }

  return {
    title: `${item.title} — GinnyTech News`,
    description: item.excerpt ?? undefined,
  }
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 1,
  })

  const item = docs[0]
  if (!item) notFound()

  const cover = getCover(item.coverImage)

  const initials = (item.author ?? 'Andrii Dyshkantiuk')
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <article className="article-wrapper">
      <Link href="/news" className="back-link">
        <BackIcon />
        Torna alle News
      </Link>

      <header className="article-header">
        <div className="article-meta">
          {item.category && (
            <span className="news-category">
              {CATEGORY_LABELS[item.category] ?? item.category}
            </span>
          )}
          {item.publishedAt && (
            <span className="news-date">{formatDate(item.publishedAt)}</span>
          )}
        </div>

        <h1>{item.title}</h1>

        {item.excerpt && <p className="article-excerpt">{item.excerpt}</p>}

        <div className="article-author">
          <div className="author-avatar">{initials}</div>
          <span>{item.author ?? 'Andrii Dyshkantiuk'}</span>
        </div>
      </header>

      {cover && (
        <div className="article-cover">
          <Image
            src={cover.url}
            alt={cover.alt || item.title}
            width={1200}
            height={675}
            priority
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      )}

      <div className="article-content">
        <RichText content={item.content} />
      </div>
    </article>
  )
}
