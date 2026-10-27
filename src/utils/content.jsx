// Renders lesson text: paragraphs, code blocks, inline `code`, links, and "VIDEO: <url>" lines.
const URL_RE = /(https?:\/\/[^\s)]+)/g
const CODE_HINT = /^(\s{2,}|print\(|def |if |for |while |const |let |#include|int |SELECT |@media|<\w|\w+\s*=\s*.+)/

const isCode = (block) => {
  const lines = block.split('\n')
  return lines.some((l) => /^\s{2,}\S/.test(l)) || (lines.length > 1 && CODE_HINT.test(lines[0])) ||
    (lines.length === 1 && /^(print\(|SELECT |const |@media|\w+\s*=\s*[^=]+$)/.test(block) && block.length < 90 && !/[.!?]$/.test(block))
}

function inline(text) {
  return text.split(/(`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return part.split(URL_RE).map((p, j) =>
      /^https?:\/\//.test(p)
        ? <a key={`${i}-${j}`} href={p} target="_blank" rel="noopener noreferrer">{p}</a>
        : p)
  })
}

export function LessonContent({ text }) {
  return text.split(/\n{2,}/).map((block, i) => {
    const video = block.match(/^VIDEO:\s*(https?:\/\/\S+)$/i)
    if (video) {
      return <p key={i}><a className="btn btn-secondary" href={video[1]} target="_blank" rel="noopener noreferrer">Open lesson video link</a></p>
    }
    if (isCode(block)) return <pre key={i} tabIndex={0}><code>{block}</code></pre>
    return <p key={i}>{inline(block)}</p>
  })
}
