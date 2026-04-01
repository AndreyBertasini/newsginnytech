'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const CATEGORY_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  tecnologia: 'Tecnologia',
  analytics: 'Analytics',
  ecommerce: 'E-commerce',
  seo: 'SEO',
  'social-media': 'Social Media',
  altro: 'Altro',
}

type Props = {
  categories: string[]
}

export function NewsFilter({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get('categoria') ?? ''

  const setCategory = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (cat && cat !== active) {
        params.set('categoria', cat)
        params.delete('pagina')
      } else {
        params.delete('categoria')
        params.delete('pagina')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [active, pathname, router, searchParams],
  )

  if (categories.length === 0) return null

  return (
    <div className="filters-bar">
      <button
        className={`filter-tag${active === '' ? ' filter-tag--active' : ''}`}
        onClick={() => setCategory('')}
        type="button"
      >
        Tutti
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`filter-tag${active === cat ? ' filter-tag--active' : ''}`}
          onClick={() => setCategory(cat)}
          type="button"
        >
          {CATEGORY_LABELS[cat] ?? cat}
        </button>
      ))}
    </div>
  )
}
