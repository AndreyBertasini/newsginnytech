import type { CollectionConfig, CollectionBeforeValidateHook } from 'payload'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96)
}

const autoSlug: CollectionBeforeValidateHook = ({ data, operation }) => {
  if ((operation === 'create' || operation === 'update') && data) {
    if (!data.slug && data.title) {
      data.slug = toSlug(data.title as string)
    }
    if (data.slug) {
      data.slug = toSlug(data.slug as string)
    }
    if (operation === 'create' && !data.publishedAt && data.status === 'published') {
      data.publishedAt = new Date().toISOString()
    }
  }
  return data
}

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
    description: 'Gestisci le news di GinnyTech. Imposta lo status su "Pubblicato" per renderle visibili.',
    listSearchableFields: ['title', 'excerpt', 'author'],
    group: 'Contenuti',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  hooks: {
    beforeValidate: [autoSlug],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Titolo dell\'articolo. Lo slug verrà generato automaticamente.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly. Generato automaticamente dal titolo, modificabile manualmente.',
        readOnly: false,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Bozza', value: 'draft' },
        { label: 'Pubblicato', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Solo gli articoli "Pubblicato" sono visibili sul sito.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Impostata automaticamente alla prima pubblicazione.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Marketing', value: 'marketing' },
        { label: 'Tecnologia', value: 'tecnologia' },
        { label: 'Analytics', value: 'analytics' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'SEO', value: 'seo' },
        { label: 'Social Media', value: 'social-media' },
        { label: 'Altro', value: 'altro' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Breve descrizione dell\'articolo mostrata nella lista news (consigliato: max 160 caratteri).',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Immagine di copertina. Consigliato: 1200×630px (rapporto 16:9).',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'Andrii Dyshkantiuk',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: true,
}
