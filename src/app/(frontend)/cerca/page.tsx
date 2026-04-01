import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import config from '@/payload.config'
import type { News } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Cerca',
  description: 'Cerca articoli e news su GinnyTech.',
  robots: { index: false },
}

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

type Props = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  let results: News[] = []

  if (query.length >= 2) {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const { docs } = await payload.find({
      collection: 'news',
      where: {
        and: [
          { status: { equals: 'published' } },
          {
            or: [
              { title: { like: query } },
              { excerpt: { like: query } },
              { author: { like: query } },
            ],
          },
        ],
      },
      sort: '-publishedAt',
      limit: 30,
      depth: 0,
    })

    results = docs as News[]
  }

  return (
    <div className="search-wrapper">
      <div className="page-hero" style={{ padding: '0 0 40px', border: 'none' }}>
        <div className="label">Ricerca</div>
        <h1>Cerca nel sito</h1>
      </div>

      <form action="/cerca" method="GET" className="search-form">
        <div className="search-input-wrap">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="9" cy="9" r="6" />
            <path d="M14 14l4 4" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Cerca articoli, categorie, argomenti…"
            className="search-input"
            autoFocus={!query}
            autoComplete="off"
          />
        </div>
        <button type="submit" className="search-submit">
          Cerca
        </button>
      </form>

      {query.length >= 2 && (
        <p className="search-results-count">
          {results.length === 0 ? (
            <>Nessun risultato per <strong>&ldquo;{query}&rdquo;</strong></>
          ) : (
            <><strong>{results.length}</strong> {results.length === 1 ? 'risultato' : 'risultati'} per <strong>&ldquo;{query}&rdquo;</strong></>
          )}
        </p>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="28" cy="28" r="18" />
            <path d="M41 41l14 14M22 28h12M28 22v12" />
          </svg>
          <h3>Nessun risultato trovato</h3>
          <p>Prova con parole chiave diverse o{' '}
            <Link href="/news" style={{ color: 'var(--color-acid-yellow)' }}>
              sfoglia tutte le news
            </Link>
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          {results.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}`} className="search-result-item">
              <div className="search-result-meta">
                {item.category && (
                  <span className="news-category">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                )}
                {item.publishedAt && (
                  <span className="news-date">{formatDate(item.publishedAt)}</span>
                )}
              </div>
              <div className="search-result-title">{item.title}</div>
              {item.excerpt && (
                <p className="search-result-excerpt">{item.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {!query && (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="28" cy="28" r="18" />
            <path d="M41 41l14 14" />
          </svg>
          <h3>Cosa stai cercando?</h3>
          <p>Digita almeno 2 caratteri per iniziare la ricerca.</p>
        </div>
      )}
    </div>
  )
}
