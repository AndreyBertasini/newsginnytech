import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import config from '@/payload.config'
import type { Metadata } from 'next'

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'Artificial Intelligence',
  ds: 'Data Science',
  de: 'Data Engineering',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Render Payload Lexical rich text nodes to plain HTML string (server side)
function renderRichText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  const root = (content as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''
  return root.children.map(renderNode).join('')
}

function renderNode(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>

  switch (n.type) {
    case 'paragraph':
      return `<p>${renderChildren(n)}</p>`
    case 'heading':
      return `<h${n.tag}>${renderChildren(n)}</h${n.tag}>`
    case 'list':
      return n.listType === 'bullet'
        ? `<ul>${renderChildren(n)}</ul>`
        : `<ol>${renderChildren(n)}</ol>`
    case 'listitem':
      return `<li>${renderChildren(n)}</li>`
    case 'quote':
      return `<blockquote>${renderChildren(n)}</blockquote>`
    case 'code':
      return `<pre><code>${escapeHtml(String(n.code ?? ''))}</code></pre>`
    case 'text': {
      let text = escapeHtml(String(n.text ?? ''))
      if (n.format) {
        const fmt = n.format as number
        if (fmt & 1) text = `<strong>${text}</strong>`
        if (fmt & 2) text = `<em>${text}</em>`
        if (fmt & 8) text = `<code>${text}</code>`
        if (fmt & 16) text = `<s>${text}</s>`
      }
      return text
    }
    case 'link': {
      const url = (n.fields as Record<string, string>)?.url ?? '#'
      return `<a href="${escapeHtml(url)}">${renderChildren(n)}</a>`
    }
    default:
      return renderChildren(n)
  }
}

function renderChildren(node: Record<string, unknown>): string {
  const children = node.children as unknown[]
  if (!Array.isArray(children)) return ''
  return children.map(renderNode).join('')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const article = docs[0]
  if (!article) return {}

  return {
    title: `${article.title} | GinnyTech News`,
    description: (article.excerpt as string) ?? undefined,
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const article = docs[0]
  if (!article) notFound()

  const category = article.category as string
  const htmlContent = renderRichText(article.content)
  const tags = (article.tags as Array<{ tag: string }>) ?? []

  return (
    <div className="article-page">
      <Link href={`/${category}`} className="article-back">
        ← {CATEGORY_LABELS[category] ?? 'Indietro'}
      </Link>

      <div className="article-header">
        <div className="card-meta">
          <span className={`badge badge-${category}`}>
            {CATEGORY_LABELS[category] ?? category}
          </span>
          {article.publishedAt && (
            <span className="card-date">{formatDate(article.publishedAt as string)}</span>
          )}
        </div>

        <h1 className="article-title">{article.title}</h1>

        {article.excerpt && (
          <div className="article-excerpt">{article.excerpt as string}</div>
        )}

        <div className="article-byline">
          <span>di {(article.author as string) || 'Redazione GinnyTech'}</span>
        </div>
      </div>

      {htmlContent && (
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}

      {tags.length > 0 && (
        <div className="article-tags">
          {tags.map((t, i) => (
            <span key={i} className="tag-chip">
              #{t.tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
