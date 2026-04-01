import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import config from '@/payload.config'

export const metadata = {
  title: 'News — GinnyTech',
  description: 'Le ultime news su MarTech, Analytics e Marketing Digitale da GinnyTech.',
}

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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 7h12M8 2l5 5-5 5" />
    </svg>
  )
}

function ImagePlaceholder() {
  return (
    <div className="news-card-image-placeholder">
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="10" width="36" height="28" rx="3" />
        <circle cx="17" cy="20" r="3" />
        <path d="M6 32l9-8 7 7 5-4 9 9" />
      </svg>
    </div>
  )
}

export default async function NewsPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: newsItems } = await payload.find({
    collection: 'news',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit: 100,
    depth: 1,
  })

  const categories = Array.from(
    new Set(newsItems.map((n) => n.category).filter(Boolean) as string[]),
  )

  return (
    <>
      <section className="page-hero">
        <div className="label">GinnyTech News</div>
        <h1>Le ultime novità</h1>
        <p>
          Aggiornamenti, approfondimenti e notizie su MarTech, Analytics e Marketing Digitale.
        </p>
      </section>

      {categories.length > 0 && (
        <div className="filters-bar">
          {categories.map((cat) => (
            <span key={cat} className="filter-tag">
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}
        </div>
      )}

      <section className="news-section">
        {newsItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="12" width="48" height="40" rx="4" />
              <path d="M8 22h48M20 12v10M44 12v10M20 34h24M20 42h16" />
            </svg>
            <h3>Nessun articolo pubblicato</h3>
            <p>Torna presto per le ultime news da GinnyTech.</p>
          </div>
        ) : (
          <div className="news-grid">
            {newsItems.map((item) => (
              <Link key={item.id} href={`/news/${item.slug}`} className="news-card">
                <div className="news-card-image">
                  {item.coverImage &&
                  typeof item.coverImage === 'object' &&
                  'url' in item.coverImage &&
                  item.coverImage.url ? (
                    <Image
                      src={item.coverImage.url}
                      alt={
                        typeof item.coverImage === 'object' && 'alt' in item.coverImage
                          ? (item.coverImage.alt as string)
                          : item.title
                      }
                      width={600}
                      height={338}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>

                <div className="news-card-body">
                  <div className="news-card-meta">
                    {item.category && (
                      <span className="news-category">
                        {CATEGORY_LABELS[item.category] ?? item.category}
                      </span>
                    )}
                    {item.publishedAt && (
                      <span className="news-date">{formatDate(item.publishedAt)}</span>
                    )}
                  </div>

                  <h2 className="news-card-title">{item.title}</h2>

                  {item.excerpt && <p className="news-card-excerpt">{item.excerpt}</p>}

                  <span className="news-card-cta">
                    Leggi articolo
                    <ArrowIcon />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
