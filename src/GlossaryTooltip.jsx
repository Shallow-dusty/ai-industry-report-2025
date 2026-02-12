import { useState, useRef, useEffect, useCallback } from 'react'

export default function GlossaryTooltip({ text, glossary, searchQuery }) {
  if (!text) return null

  const parts = text.split(/(⟦[^⟧]+⟧)/g)

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/⟦([^⟧]+)⟧/)
        if (match) {
          const term = match[1]
          const definition = glossary[term]
          return (
            <TermWithTooltip key={i} term={term} definition={definition} searchQuery={searchQuery} />
          )
        }
        return <HighlightedText key={i} text={part} searchQuery={searchQuery} />
      })}
    </>
  )
}

function TermWithTooltip({ term, definition, searchQuery }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)
  const tooltipRef = useRef(null)

  // Measure actual tooltip height after render and reposition if needed
  useEffect(() => {
    if (show && tooltipRef.current && ref.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const termRect = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - termRect.bottom
      const above = spaceBelow < tooltipRect.height + 16
      setPos({
        top: above ? termRect.top - tooltipRect.height - 8 : termRect.bottom + 8,
        left: Math.min(termRect.left, window.innerWidth - 320)
      })
    }
  }, [show])

  const handleEnter = useCallback(() => {
    if (!definition) return
    const rect = ref.current?.getBoundingClientRect()
    if (rect) {
      // Initial position (below term), will be corrected by useEffect after measuring
      setPos({
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 320)
      })
    }
    setShow(true)
  }, [definition])

  const handleLeave = useCallback(() => setShow(false), [])
  const handleToggle = useCallback(() => {
    if (show) setShow(false)
    else handleEnter()
  }, [show, handleEnter])

  return (
    <>
      <span
        ref={ref}
        className="glossary-term"
        tabIndex={0}
        role="button"
        aria-label={`术语：${term}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        onClick={handleToggle}
      >
        <HighlightedText text={term} searchQuery={searchQuery} />
      </span>
      {show && definition && (
        <span
          ref={tooltipRef}
          className="fixed z-[9999] max-w-[300px] px-3 py-2 rounded-lg text-sm"
          style={{
            top: pos.top,
            left: pos.left,
            background: 'rgba(15, 15, 22, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--color-text-dim)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            pointerEvents: 'none'
          }}
        >
          <span className="font-semibold text-accent block mb-1">{term}</span>
          {definition}
        </span>
      )}
    </>
  )
}

export function HighlightedText({ text, searchQuery }) {
  if (!searchQuery || !text) return text

  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <mark key={i}>{part}</mark> : part
      )}
    </>
  )
}
