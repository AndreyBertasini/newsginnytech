import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

import config from '@/payload.config'
import './styles.css'

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'Artificial Intelligence',
  ds: 'Data Science',
  de: 'Data Engineering',
}

const CATEGORY_ICONS: Record<string, string> = {
  ai: '🤖',
  ds: '📊',
  de: '⚙️',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 30,
  })

  const featured = articles[0] ?? null
  const rest = articles.slice(1)

  const byCategory = {
    ai: rest.filter((a) => a.category === 'ai'),
    ds: rest.filter((a) => a.category === 'ds'),
    de: rest.filter((a) => a.category === 'de'),
  }

  return (
    <>
      {/* HERO */}
      <div className="home-hero">
        <h1>
          Le notizie su <span className="hero-accent">AI, Data Science</span>
          <br />e Data Engineering
        </h1>
        <p>Il punto di riferimento italiano per professionisti dei dati e dell&apos;intelligenza artificiale.</p>
      </div>

      {/* FEATURED */}
      {featured && (
        <Link href={`/articles/${featured.slug}`} style={{ display: 'block' }}>
          <div className="article-featured">
            <div>
              <div className="featured-label">In evidenza</div>
              <div className="card-meta" style={{ marginBottom: '0.75rem' }}>
                <span className={`badge badge-${featured.category}`}>
                  {CATEGORY_LABELS[featured.category as string] ?? featured.category}
                </span>
                {featured.publishedAt && (
                  <span className="card-date">{formatDate(featured.publishedAt as string)}</span>
                )}
              </div>
              <div className="featured-title">{featured.title}</div>
              {featured.excerpt && <div className="featured-excerpt">{featured.excerpt as string}</div>}
              <span className="featured-cta">Leggi l&apos;articolo →</span>
            </div>
            <div className="featured-image-box">
              {CATEGORY_ICONS[featured.category as string] ?? '📰'}
            </div>
          </div>
        </Link>
      )}

      {/* SECTIONS PER CATEGORY */}
      {(['ai', 'ds', 'de'] as const).map((cat) => {
        const items = byCategory[cat]
        if (items.length === 0) return null
        return (
          <div key={cat}>
            <div className="section-header">
              <h2>{CATEGORY_LABELS[cat]}</h2>
              <div className="section-line" />
              <Link href={`/${cat}`} className={`nav-link nav-${cat}`} style={{ fontSize: '0.75rem' }}>
                Vedi tutti →
              </Link>
            </div>
            <div className="articles-grid">
              {items.slice(0, 3).map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`}>
                  <div className="article-card">
                    <div className="card-meta">
                      <span className={`badge badge-${cat}`}>{CATEGORY_LABELS[cat]}</span>
                      {article.publishedAt && (
                        <span className="card-date">{formatDate(article.publishedAt as string)}</span>
                      )}
                    </div>
                    <div className="card-title">{article.title}</div>
                    {article.excerpt && (
                      <div className="card-excerpt">{article.excerpt as string}</div>
                    )}
                    <div className="card-footer">
                      <span className="card-author">
                        {(article.author as string) || 'Redazione'}
                      </span>
                      <span className={`card-read-${cat}`}>Leggi →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )
      })}

      {/* EMPTY STATE */}
      {articles.length === 0 && (
        <div className="empty-state">
          <h3>Nessun articolo pubblicato</h3>
          <p>
            Accedi all&apos;{' '}
            <Link href="/admin" style={{ color: 'var(--color-ai)' }}>
              area admin
            </Link>{' '}
            per pubblicare il primo articolo.
          </p>
        </div>
      )}
    </>
  )
}
