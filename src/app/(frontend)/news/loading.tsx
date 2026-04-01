import React from 'react'

function SkeletonCard() {
  return (
    <div className="news-card skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="news-card-body">
        <div className="skeleton-meta">
          <div className="skeleton skeleton-badge" />
          <div className="skeleton skeleton-date" />
        </div>
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-title" style={{ width: '70%' }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
        <div className="skeleton skeleton-text" style={{ width: '55%' }} />
      </div>
    </div>
  )
}

export default function NewsLoading() {
  return (
    <>
      <section className="page-hero">
        <div className="skeleton skeleton-label" />
        <div className="skeleton skeleton-h1" />
        <div className="skeleton skeleton-subtitle" />
      </section>

      <div className="filters-bar">
        {[80, 100, 90, 110, 75].map((w, i) => (
          <div key={i} className="skeleton skeleton-filter" style={{ width: w }} />
        ))}
      </div>

      <section className="news-section">
        <div className="news-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    </>
  )
}
