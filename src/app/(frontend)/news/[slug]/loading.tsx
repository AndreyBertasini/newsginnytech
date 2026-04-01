import React from 'react'

export default function ArticleLoading() {
  return (
    <article className="article-wrapper">
      <div className="skeleton skeleton-back" />

      <header className="article-header">
        <div className="skeleton-meta" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div className="skeleton skeleton-badge" />
          <div className="skeleton skeleton-date" />
        </div>
        <div className="skeleton skeleton-article-title" />
        <div className="skeleton skeleton-article-title" style={{ width: '80%' }} />
        <div className="skeleton skeleton-article-title" style={{ width: '60%', marginBottom: 32 }} />
        <div className="skeleton skeleton-excerpt" />
        <div className="skeleton skeleton-excerpt" style={{ width: '90%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <div className="skeleton skeleton-avatar" />
          <div className="skeleton skeleton-author" />
        </div>
      </header>

      <div className="skeleton skeleton-cover" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
        {[100, 95, 88, 100, 72, 100, 90, 60].map((w, i) => (
          <div key={i} className="skeleton skeleton-prose" style={{ width: `${w}%` }} />
        ))}
      </div>
    </article>
  )
}
