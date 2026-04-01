import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import type { Metadata } from 'next'

const CATEGORIES = {
  ai: {
    label: 'Artificial Intelligence',
    desc: 'Modelli linguistici, machine learning, robotica e tutto ciò che riguarda l\'intelligenza artificiale.',
  },
  ds: {
    label: 'Data Science',
    desc: 'Analisi dei dati, statistica, visualizzazione e tecniche per estrarre valore dai dati.',
  },
  de: {
    label: 'Data Engineering',
    desc: 'Pipeline, data warehouse, orchestrazione e infrastruttura per i dati.',
  },
} as const

type CategoryKey = keyof typeof CATEGORIES

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((cat) => ({ category: cat }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES[category as CategoryKey]
  if (!cat) return {}
  return {
    title: `${cat.label} | GinnyTech News`,
    description: cat.desc,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  if (!(category in CATEGORIES)) notFound()

  const cat = CATEGORIES[category as CategoryKey]

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: {
      and: [
        { status: { equals: 'published' } },
        { category: { equals: category } },
      ],
    },
    sort: '-publishedAt',
    limit: 50,
  })

  return (
    <>
      <div className="category-header">
        <Link href="/" className="article-back">← Home</Link>
        <h1>
          <span className={`category-dot dot-${category}`} />
          {cat.label}
        </h1>
        <p className="category-desc">{cat.desc}</p>
      </div>

      {articles.length > 0 ? (
        <div className="articles-grid">
          {articles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <div className="article-card">
                <div className="card-meta">
                  <span className={`badge badge-${category}`}>{cat.label}</span>
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
                  <span className={`card-read-${category}`}>Leggi →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>Nessun articolo pubblicato</h3>
          <p>Torna presto, stiamo preparando nuovi contenuti.</p>
        </div>
      )}
    </>
  )
}
