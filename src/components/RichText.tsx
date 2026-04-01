import React, { Fragment } from 'react'

type LexicalNode = {
  type: string
  version?: number
  tag?: string
  format?: number | string
  indent?: number
  direction?: string
  children?: LexicalNode[]
  text?: string
  url?: string
  newTab?: boolean
  value?: { url?: string; alt?: string }
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

function serializeText(node: LexicalNode): React.ReactNode {
  if (!node.text) return null

  let content: React.ReactNode = node.text

  const format = typeof node.format === 'number' ? node.format : 0

  if (format & 1) content = <strong>{content}</strong>
  if (format & 2) content = <em>{content}</em>
  if (format & 8) content = <u style={{ textDecoration: 'underline' }}>{content}</u>
  if (format & 4) content = <s>{content}</s>
  if (format & 16) content = <code>{content}</code>

  return content
}

function serializeNode(node: LexicalNode, index: number): React.ReactNode {
  switch (node.type) {
    case 'text':
      return <Fragment key={index}>{serializeText(node)}</Fragment>

    case 'linebreak':
      return <br key={index} />

    case 'paragraph':
      return (
        <p key={index}>
          {node.children?.map((child, i) => serializeNode(child, i))}
        </p>
      )

    case 'heading':
      const Tag = (node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') ?? 'h2'
      return (
        <Tag key={index}>
          {node.children?.map((child, i) => serializeNode(child, i))}
        </Tag>
      )

    case 'list':
      if (node.tag === 'ol') {
        return (
          <ol key={index}>
            {node.children?.map((child, i) => serializeNode(child, i))}
          </ol>
        )
      }
      return (
        <ul key={index}>
          {node.children?.map((child, i) => serializeNode(child, i))}
        </ul>
      )

    case 'listitem':
      return (
        <li key={index}>
          {node.children?.map((child, i) => serializeNode(child, i))}
        </li>
      )

    case 'quote':
      return (
        <blockquote key={index}>
          {node.children?.map((child, i) => serializeNode(child, i))}
        </blockquote>
      )

    case 'code':
      return (
        <pre key={index}>
          <code>{node.children?.map((child, i) => serializeNode(child, i))}</code>
        </pre>
      )

    case 'link':
    case 'autolink':
      return (
        <a
          key={index}
          href={node.url ?? '#'}
          target={node.newTab ? '_blank' : undefined}
          rel={node.newTab ? 'noopener noreferrer' : undefined}
        >
          {node.children?.map((child, i) => serializeNode(child, i))}
        </a>
      )

    case 'horizontalrule':
      return <hr key={index} />

    default:
      if (node.children) {
        return (
          <Fragment key={index}>
            {node.children.map((child, i) => serializeNode(child, i))}
          </Fragment>
        )
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
      {lexical.root.children.map((node, i) => serializeNode(node, i))}
    </>
  )
}
