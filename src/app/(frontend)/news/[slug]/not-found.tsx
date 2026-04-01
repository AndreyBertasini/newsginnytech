import React from 'react'
import Link from 'next/link'

export default function ArticleNotFound() {
  return (
    <div className="not-found">
      <div className="code">404</div>
      <h2>Articolo non trovato</h2>
      <p>
        L&apos;articolo che cerchi non esiste, è stato rimosso o non è ancora pubblicato.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/news" className="btn btn-primary">
          Tutte le News
        </Link>
        <Link href="/cerca" className="btn btn-ghost">
          Cerca un articolo
        </Link>
      </div>
    </div>
  )
}
