import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import config from '@/payload.config'
import type { News, Media } from '@/payload-types'
import { NewsFilter } from '@/components/NewsFilter'

const PER_PAGE = 12

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}): Promise<Metadata> {
  const { categoria } = await searchParams
  const label = categoria ? (CATEGORY_LABELS[categoria] ?? categoria) : null
  return {
    title: label ? `News ${label}` : 'News',
    description: label
      ? `Le ultime news GinnyTech su ${label}.`
      : 'Le ultime news su MarTech, Analytics e Marketing Digitale da GinnyTech.',
    openGraph: {
      url: `${SITE_URL}/news`,
    },
  }
}

export const revalidate = 60

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getCoverUrl(coverImage: News['coverImage']): string | null {
  if (!coverImage || typeof coverImage === 'number') return null
  return (coverImage as Media).url ?? null
}

function getCoverAlt(coverImage: News['coverImage'], fallback: string): string {
  if (!coverImage || typeof coverImage === 'number') return fallback
  return (coverImage as Media).alt ?? fallback
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 7h12M8 2l5 5-5 5" />
    </svg>
  )
}

function PaginationLink({
  href,
  label,
  active,
  disabled,
}: {
  href: string
  label: string | number
  active?: boolean
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <span className="pagination-btn" aria-disabled="true" style={{ opacity: 0.3 }}>
        {label}
      </span>
    )
  }
  return (
    <Link
      href={href}
      className={`pagination-btn${active ? ' pagination-btn--active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  )
}

function buildHref(page: number, categoria?: string) {
  const params = new URLSearchParams()
  if (categoria) params.set('categoria', categoria)
  if (page > 1) params.set('pagina', String(page))
  const qs = params.toString()
  return `/news${qs ? `?${qs}` : ''}`
}

type Props = {
  searchParams: Promise<{ categoria?: string; pagina?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const { categoria, pagina } = await searchParams
  const page = Math.max(1, parseInt(pagina ?? '1', 10) || 1)

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const where: Record<string, unknown> = { status: { equals: 'published' } }
  if (categoria) where.category = { equals: categoria }

  const { docs: newsItems, totalDocs } = await payload.find({
    collection: 'news',
    where,
    sort: '-publishedAt',
    limit: PER_PAGE,
    page,
    depth: 1,
  })

  // Fetch all categories for filter (from all published articles)
  const { docs: allItems } = await payload.find({
    collection: 'news',
    where: { status: { equals: 'published' } },
    limit: 0,
    depth: 0,
    select: { category: true },
  })

  const categories = Array.from(
    new Set(allItems.map((n) => n.category).filter(Boolean) as string[]),
  )

  const totalPages = Math.ceil(totalDocs / PER_PAGE)

  // Build pagination page numbers
  const pageNumbers: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
  } else {
    pageNumbers.push(1)
    if (page > 3) pageNumbers.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNumbers.push(i)
    }
    if (page < totalPages - 2) pageNumbers.push('...')
    pageNumbers.push(totalPages)
  }

  const categoryLabel = categoria ? (CATEGORY_LABELS[categoria] ?? categoria) : null

  return (
    <>
      <section className="page-hero">
        <div className="label">GinnyTech News</div>
        <h1>{categoryLabel ? `News · ${categoryLabel}` : 'Le ultime novità'}</h1>
        <p>
          {categoryLabel
            ? `Tutti gli articoli nella categoria ${categoryLabel}.`
            : 'Aggiornamenti, approfondimenti e notizie su MarTech, Analytics e Marketing Digitale.'}
        </p>
      </section>

      <Suspense>
        <NewsFilter categories={categories} />
      </Suspense>

      <section className="news-section">
        {newsItems.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="12" width="48" height="40" rx="4" />
              <path d="M8 22h48M20 12v10M44 12v10M20 34h24M20 42h16" />
            </svg>
            <h3>Nessun articolo trovato</h3>
            <p>
              {categoria
                ? 'Nessun articolo in questa categoria. '
                : 'Torna presto per le ultime news da GinnyTech.'}
              {categoria && (
                <Link href="/news" style={{ color: 'var(--color-acid-yellow)', marginLeft: 4 }}>
                  Vedi tutti
                </Link>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="news-grid">
              {newsItems.map((item) => {
                const coverUrl = getCoverUrl(item.coverImage)
                const coverAlt = getCoverAlt(item.coverImage, item.title)
                return (
                  <Link key={item.id} href={`/news/${item.slug}`} className="news-card">
                    <div className="news-card-image">
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={coverAlt}
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
                )
              })}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Pagine">
                <PaginationLink
                  href={buildHref(page - 1, categoria)}
                  label="←"
                  disabled={page <= 1}
                />
                {pageNumbers.map((n, i) =>
                  n === '...' ? (
                    <span key={`dots-${i}`} className="pagination-dots">
                      …
                    </span>
                  ) : (
                    <PaginationLink
                      key={n}
                      href={buildHref(n, categoria)}
                      label={n}
                      active={n === page}
                    />
                  ),
                )}
                <PaginationLink
                  href={buildHref(page + 1, categoria)}
                  label="→"
                  disabled={page >= totalPages}
                />
              </nav>
            )}
          </>
        )}
      </section>
    </>
  )
}
