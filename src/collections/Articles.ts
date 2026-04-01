import type { CollectionConfig } from 'payload'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
    description: 'Gestisci le notizie del sito',
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titolo',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug URL',
      admin: {
        description: 'Identificatore URL (es. "gpt-5-annuncio"). Usa solo lettere minuscole, numeri e trattini.',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Categoria',
      options: [
        { label: 'Artificial Intelligence', value: 'ai' },
        { label: 'Data Science', value: 'ds' },
        { label: 'Data Engineering', value: 'de' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Stato',
      defaultValue: 'draft',
      options: [
        { label: 'Bozza', value: 'draft' },
        { label: 'Pubblicato', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Data di pubblicazione',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Lascia vuoto per usare la data corrente',
      },
    },
    {
      name: 'author',
      type: 'text',
      label: 'Autore',
      admin: { position: 'sidebar' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Estratto',
      admin: {
        description: 'Breve descrizione mostrata nelle anteprime (max 250 caratteri)',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Immagine di copertina',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Contenuto',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tag',
      admin: {
        description: 'Aggiungi tag per migliorare la ricerca',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Tag',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
