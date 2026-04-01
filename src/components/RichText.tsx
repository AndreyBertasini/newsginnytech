import React, { Fragment } from 'react'

type TextFormatFlags = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
}

type LexicalNode = {
  type: string
  version?: number
  tag?: string
  format?: number | string
  listType?: 'bullet' | 'number' | 'check'
  indent?: number
  direction?: string
  children?: LexicalNode[]
  text?: string
  url?: string
  newTab?: boolean
  checked?: boolean
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: string
  }
}

type LexicalRoot = {
  root: {
    type: string
    children: LexicalNode[]
    direction?: string
    format?: string
    indent?: number
    version?: number
  }
}

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_UNDERLINE = 8
const FORMAT_CODE = 16

function serializeText(node: LexicalNode): React.ReactNode {
  if (node.text === undefined || node.text === null) return null

  const text = node.text
  if (text === '') return null

  const fmt = typeof node.format === 'number' ? node.format : 0
  let content: React.ReactNode = text

  if (fmt & FORMAT_CODE) return <code key="code">{text}</code>
  if (fmt & FORMAT_BOLD) content = <strong>{content}</strong>
  if (fmt & FORMAT_ITALIC) content = <em>{content}</em>
  if (fmt & FORMAT_STRIKETHROUGH) content = <s>{content}</s>
  if (fmt & FORMAT_UNDERLINE) content = <u style={{ textDecoration: 'underline' }}>{content}</u>

  return content
}

function serializeChildren(children: LexicalNode[] | undefined): React.ReactNode {
  if (!children) return null
  return children.map((child, i) => (
    <Fragment key={i}>{serializeNode(child, i)}</Fragment>
  ))
}

function serializeNode(node: LexicalNode, index: number): React.ReactNode {
  switch (node.type) {
    case 'text':
      return serializeText(node)

    case 'tab':
      return '\t'

    case 'linebreak':
      return <br />

    case 'paragraph':
      if (!node.children || node.children.length === 0) return <br />
      return <p>{serializeChildren(node.children)}</p>

    case 'heading': {
      const Tag = (node.tag ?? 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
      return <Tag>{serializeChildren(node.children)}</Tag>
    }

    case 'list': {
      const isOrdered = node.listType === 'number'
      if (isOrdered) {
        return <ol>{serializeChildren(node.children)}</ol>
      }
      return <ul>{serializeChildren(node.children)}</ul>
    }

    case 'listitem':
      return <li>{serializeChildren(node.children)}</li>

    case 'quote':
      return <blockquote>{serializeChildren(node.children)}</blockquote>

    case 'code':
      return (
        <pre>
          <code>{serializeChildren(node.children)}</code>
        </pre>
      )

    case 'link':
    case 'autolink': {
      const href = node.fields?.url ?? node.url ?? '#'
      const newTab = node.fields?.newTab ?? node.newTab ?? false
      return (
        <a href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined}>
          {serializeChildren(node.children)}
        </a>
      )
    }

    case 'horizontalrule':
      return <hr />

    case 'image': {
      const src = (node as unknown as { src?: string; altText?: string; width?: number; height?: number }).src
      const alt = (node as unknown as { altText?: string }).altText ?? ''
      if (!src) return null
      return (
        <figure style={{ margin: '1.5em 0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: '8px' }} />
        </figure>
      )
    }

    default:
      if (node.children) {
        return <>{serializeChildren(node.children)}</>
      }
      return null
  }
}

export function RichText({ content }: { content: unknown }) {
  if (!content) return null

  const lexical = content as LexicalRoot
  if (!lexical?.root?.children) return null

  return (
    <>
      {lexical.root.children.map((node, i) => (
        <Fragment key={i}>{serializeNode(node, i)}</Fragment>
      ))}
    </>
  )
}
