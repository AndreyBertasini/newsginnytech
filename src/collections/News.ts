import type { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return {
        status: {
          equals: 'published',
        },
      }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
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
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
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
        description: 'Breve descrizione dell\'articolo (max 200 caratteri)',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
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
    },
  ],
  timestamps: true,
}
