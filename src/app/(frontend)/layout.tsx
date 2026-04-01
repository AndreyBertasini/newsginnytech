import React from 'react'
import Link from 'next/link'
import './styles.css'

export const metadata = {
  title: 'GinnyTech News',
  description: 'Le ultime notizie su Artificial Intelligence, Data Science e Data Engineering',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="it">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="site-logo">
              <span className="logo-ginny">Ginny</span>
              <span className="logo-tech">Tech</span>
              <span className="logo-news">News</span>
            </Link>
            <nav className="site-nav">
              <Link href="/ai" className="nav-link nav-ai">AI</Link>
              <Link href="/ds" className="nav-link nav-ds">Data Science</Link>
              <Link href="/de" className="nav-link nav-de">Data Engineering</Link>
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <p>© {new Date().getFullYear()} GinnyTech News · AI · Data Science · Data Engineering</p>
            <a href="/admin" className="footer-admin">Admin</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
