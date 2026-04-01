import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="code">404</div>
      <h2>Pagina non trovata</h2>
      <p>L&apos;articolo che cerchi non esiste o è stato rimosso.</p>
      <Link href="/news" className="btn btn-primary">
        Torna alle News
      </Link>
    </div>
  )
}
