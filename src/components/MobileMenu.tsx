'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: 'https://ginnytech.it', label: 'Home', external: true },
  { href: 'https://ginnytech.it/course', label: 'Corso', external: true },
  { href: '/news', label: 'News', external: false },
  { href: '/cerca', label: 'Cerca', external: false },
  { href: 'https://ginnytech.it/perche-questo-corso', label: 'Informazioni', external: true },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        className="mobile-menu-toggle"
        aria-label={open ? 'Chiudi menu' : 'Apri menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="mobile-menu-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <div className={`mobile-menu-drawer${open ? ' mobile-menu-drawer--open' : ''}`}>
        <nav className="mobile-nav">
          {NAV_LINKS.map(({ href, label, external }) =>
            external ? (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-nav-link"
                onClick={() => setOpen(false)}
              >
                {label}
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="external-icon">
                  <path d="M2 2h8v8M10 2 2 10" />
                </svg>
              </a>
            ) : (
              <Link
                key={href}
                href={href}
                className={`mobile-nav-link${pathname === href || pathname.startsWith(href + '/') ? ' mobile-nav-link--active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        <div className="mobile-menu-cta">
          <a
            href="https://tidycal.com/andrii-d/15-minute-meeting"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setOpen(false)}
          >
            Prenota una call
          </a>
        </div>
      </div>
    </>
  )
}
