import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import config from '@/payload.config'
import type { News, Media } from '@/payload-types'
import { RichText } from '@/components/RichText'

export const revalidate = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://news.ginnytech.it'

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

function getCover(coverImage: News['coverImage']): { url: string; alt: string } | null {
  if (!coverImage || typeof coverImage === 'number') return null
  const media = coverImage as Media
  if (!media.url) return null
  return { url: media.url, alt: media.alt ?? '' }
}

type Props = { params: Promise<{ slug: string }> }

/* ─── STATIC PARAMS ─────────────────────────────────────────── */
export async function generateStaticParams() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
    select: { slug: true },
  })

  return docs.map((item) => ({ slug: item.slug }))
}

/* ─── METADATA ───────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  if (!item) return { title: 'Articolo non trovato' }

  const cover = getCover(item.coverImage)

  return {
    title: item.title,
    description: item.excerpt ?? undefined,
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/news/${item.slug}`,
      title: item.title,
      description: item.excerpt ?? undefined,
      publishedTime: item.publishedAt ?? undefined,
      authors: item.author ? [item.author] : undefined,
      images: cover
        ? [{ url: cover.url, alt: cover.alt || item.title, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.excerpt ?? undefined,
      images: cover ? [cover.url] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/news/${item.slug}`,
    },
  }
}

/* ─── PAGE ───────────────────────────────────────────────────── */
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

  // Related articles: same category, exclude current
  const relatedWhere: Record<string, unknown> = {
    status: { equals: 'published' },
    slug: { not_equals: item.slug },
  }
  if (item.category) relatedWhere.category = { equals: item.category }

  const { docs: related } = await payload.find({
    collection: 'news',
    where: relatedWhere,
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  })

  return (
    <>
      <article className="article-wrapper">
        <Link href="/news" className="back-link">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
            <path d="M10 3L5 8l5 5" />
          </svg>
          Torna alle News
        </Link>

        <header className="article-header">
          <div className="article-meta">
            {item.category && (
              <Link
                href={`/news?categoria=${item.category}`}
                className="news-category"
                style={{ textDecoration: 'none' }}
              >
                {CATEGORY_LABELS[item.category] ?? item.category}
              </Link>
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

        {/* Share bar */}
        <div className="article-share">
          <span className="article-share-label">Condividi</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE_URL}/news/${item.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
            aria-label="Condividi su LinkedIn"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(`${SITE_URL}/news/${item.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
            aria-label="Condividi su X"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            X / Twitter
          </a>
        </div>
      </article>

      {related.length > 0 && (
        <section className="related-section">
          <div className="related-inner">
            <div className="related-header">
              <span className="label">Articoli correlati</span>
            </div>
            <div className="related-grid">
              {related.map((rel) => {
                const relCover = getCover(rel.coverImage)
                return (
                  <Link key={rel.id} href={`/news/${rel.slug}`} className="news-card">
                    <div className="news-card-image">
                      {relCover ? (
                        <Image
                          src={relCover.url}
                          alt={relCover.alt || rel.title}
                          width={400}
                          height={225}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <div className="news-card-image-placeholder">
                          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="6" y="10" width="36" height="28" rx="3" />
                            <circle cx="17" cy="20" r="3" />
                            <path d="M6 32l9-8 7 7 5-4 9 9" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="news-card-body">
                      <div className="news-card-meta">
                        {rel.category && (
                          <span className="news-category">
                            {CATEGORY_LABELS[rel.category] ?? rel.category}
                          </span>
                        )}
                        {rel.publishedAt && (
                          <span className="news-date">{formatDate(rel.publishedAt)}</span>
                        )}
                      </div>
                      <h3 className="news-card-title">{rel.title}</h3>
                      {rel.excerpt && <p className="news-card-excerpt">{rel.excerpt}</p>}
                      <span className="news-card-cta">
                        Leggi articolo
                        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                          <path d="M1 7h12M8 2l5 5-5 5" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
