import { motion } from 'framer-motion'
import { AlertCircle, Calendar } from 'lucide-react'
import GlossaryTooltip, { HighlightedText } from './GlossaryTooltip'
import { colorMap, colorBgMap } from './theme'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function isTimelineTable(headers) {
  if (!headers || headers.length === 0) return false
  const first = headers[0].toLowerCase()
  const isTimeBased = first === '时间' || first === 'time' || first === '版本'
  // Wide cross-reference tables (4+ columns) should NOT be rendered as simple timelines
  return isTimeBased && headers.length <= 3
}

function isWideTimelineTable(headers) {
  if (!headers || headers.length < 4) return false
  const first = headers[0].toLowerCase()
  return first === '时间' || first === 'time'
}

// Wide cross-reference timeline (4+ columns with time as first column)
function WideTimelineTable({ data, glossary, searchQuery }) {
  const { headers, rows, subtitle } = data
  const trackColors = ['accent', 'green', 'blue', 'orange', 'pink']
  return (
    <div className="space-y-1">
      {subtitle && (
        <h4 className="text-sm font-semibold text-text-dim mb-3 uppercase tracking-wider">
          <HighlightedText text={subtitle} searchQuery={searchQuery} />
        </h4>
      )}
      {/* Column legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {headers.slice(1).map((h, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-text-dim">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: colorMap[trackColors[i]] || colorMap.accent }}
            />
            {h}
          </div>
        ))}
      </div>
      <div className="relative pl-6 border-l border-border">
        {rows.map((row, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="relative mb-5 last:mb-0"
          >
            {/* Timeline dot */}
            <div
              className="absolute -left-[31px] top-2 w-3 h-3 rounded-full border-2 border-accent"
              style={{ background: 'var(--color-bg)' }}
            />
            {/* Time label */}
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={12} className="text-accent" />
              <span className="text-sm font-mono font-bold text-accent">
                <HighlightedText text={row[0]} searchQuery={searchQuery} />
              </span>
            </div>
            {/* Multi-track grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {row.slice(1).map((cell, j) => {
                const color = trackColors[j] || 'accent'
                if (!cell || cell === '—' || cell === '-') return (
                  <div key={j} className="rounded-lg p-3 text-sm opacity-30"
                    style={{ background: colorBgMap[color] || colorBgMap.accent }}>
                    <div className="text-[10px] uppercase tracking-wider font-semibold"
                      style={{ color: colorMap[color] }}>{headers[j + 1]}</div>
                    <div className="text-text-muted">—</div>
                  </div>
                )
                return (
                  <div
                    key={j}
                    className="rounded-lg p-3 text-sm"
                    style={{
                      background: colorBgMap[color] || colorBgMap.accent,
                      borderLeft: `2px solid ${colorMap[color]}`
                    }}
                  >
                    <div
                      className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                      style={{ color: colorMap[color] }}
                    >
                      {headers[j + 1]}
                    </div>
                    <div className="text-text-dim leading-relaxed">
                      <GlossaryTooltip text={cell} glossary={glossary} searchQuery={searchQuery} />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Timeline renderer for tables with a time column
function TimelineTable({ data, glossary, searchQuery }) {
  const { headers, rows, subtitle } = data
  return (
    <div className="space-y-1">
      {subtitle && (
        <h4 className="text-sm font-semibold text-text-dim mb-3 uppercase tracking-wider">
          <HighlightedText text={subtitle} searchQuery={searchQuery} />
        </h4>
      )}
      <div className="relative pl-6 border-l border-border">
        {rows.map((row, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="relative mb-4 last:mb-0"
          >
            {/* Timeline dot */}
            <div
              className="absolute -left-[31px] top-2 w-3 h-3 rounded-full border-2 border-accent"
              style={{ background: 'var(--color-bg)' }}
            />
            <div
              className="rounded-lg p-4 hover:bg-card-hover transition-colors duration-200"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-accent" />
                <span className="text-xs font-mono text-accent">
                  <HighlightedText text={row[0]} searchQuery={searchQuery} />
                </span>
              </div>
              {row.slice(1).map((cell, j) => (
                <div key={j} className={j === 0 ? "font-semibold text-sm mb-1" : "text-sm text-text-dim"}>
                  {headers[j + 1] && (
                    <span className="text-text-muted text-xs mr-2">{headers[j + 1]}:</span>
                  )}
                  <GlossaryTooltip text={cell} glossary={glossary} searchQuery={searchQuery} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Card-based table for non-timeline tables
function CardTable({ data, glossary, searchQuery }) {
  const { headers, rows, subtitle } = data
  return (
    <div>
      {subtitle && (
        <h4 className="text-sm font-semibold text-text-dim mb-3 uppercase tracking-wider">
          <HighlightedText text={subtitle} searchQuery={searchQuery} />
        </h4>
      )}
      <div className="space-y-2">
        {rows.map((row, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="rounded-lg p-4 hover:bg-card-hover transition-all duration-200 hover:border-accent/30"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div className="grid gap-1">
              {row.map((cell, j) => (
                <div key={j} className={j === 0 ? "font-semibold text-sm" : "text-sm text-text-dim"}>
                  {headers[j] && j > 0 && (
                    <span className="text-text-muted text-xs mr-1.5">{headers[j]}:</span>
                  )}
                  <GlossaryTooltip text={cell} glossary={glossary} searchQuery={searchQuery} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function TableRenderer({ data, glossary, searchQuery }) {
  if (isWideTimelineTable(data.headers)) {
    return <WideTimelineTable data={data} glossary={glossary} searchQuery={searchQuery} />
  }
  if (isTimelineTable(data.headers)) {
    return <TimelineTable data={data} glossary={glossary} searchQuery={searchQuery} />
  }
  return <CardTable data={data} glossary={glossary} searchQuery={searchQuery} />
}

export function StatsRenderer({ data, searchQuery }) {
  const { items } = data
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="glass-elevated rounded-xl p-4 text-center hover:scale-[1.02] transition-transform duration-200 relative overflow-hidden"
          style={{
            borderColor: `${colorMap[item.color] || colorMap.accent}20`
          }}
        >
          {/* Top gradient accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${colorMap[item.color] || colorMap.accent}, transparent)`
            }}
          />
          <div
            className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1"
            style={{ color: colorMap[item.color] || colorMap.accent }}
          >
            <HighlightedText text={item.value} searchQuery={searchQuery} />
          </div>
          <div className="text-xs text-text-dim leading-tight">
            <HighlightedText text={item.label} searchQuery={searchQuery} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function TrendsRenderer({ data, glossary, searchQuery }) {
  const { items } = data
  const trendColors = [
    'accent', 'green', 'blue', 'orange', 'pink',
    'accent', 'green', 'blue', 'orange', 'pink'
  ]
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="rounded-xl p-5 hover:bg-card-hover transition-all duration-300 relative overflow-hidden"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderLeft: `3px solid ${colorMap[trendColors[i]] || colorMap.accent}`
          }}
        >
          {/* Subtle glow behind the number */}
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${colorMap[trendColors[i]] || colorMap.accent}08, transparent 70%)`
            }}
          />
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black"
              style={{
                background: colorBgMap[trendColors[i]] || colorBgMap.accent,
                color: colorMap[trendColors[i]] || colorMap.accent
              }}
            >
              {item.num}
            </div>
            <div>
              <h4 className="font-bold text-base mb-1">
                <HighlightedText text={item.title} searchQuery={searchQuery} />
              </h4>
              <p className="text-sm text-text-dim leading-relaxed">
                <GlossaryTooltip text={item.description} glossary={glossary} searchQuery={searchQuery} />
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function CardsRenderer({ data, glossary, searchQuery }) {
  const { items } = data
  const cardColors = ['accent', 'green', 'blue', 'orange', 'pink', 'accent', 'green', 'blue']
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="glass rounded-xl p-5 hover:scale-[1.01] transition-all duration-200"
          style={{
            borderColor: `${colorMap[cardColors[i]] || colorMap.accent}20`
          }}
        >
          <h4
            className="font-bold text-sm mb-2"
            style={{ color: colorMap[cardColors[i]] || colorMap.accent }}
          >
            <HighlightedText text={item.title} searchQuery={searchQuery} />
          </h4>
          <p className="text-sm text-text-dim leading-relaxed">
            <GlossaryTooltip text={item.text} glossary={glossary} searchQuery={searchQuery} />
          </p>
        </motion.div>
      ))}
    </div>
  )
}

export function NoteRenderer({ data, glossary, searchQuery }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="rounded-lg p-4 flex items-start gap-3 relative overflow-hidden"
      style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}
    >
      {/* Left glow indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: 'linear-gradient(180deg, var(--color-accent), var(--color-blue))',
          boxShadow: '0 0 8px var(--color-accent-glow)'
        }}
      />
      <AlertCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
      <p className="text-sm text-text-dim leading-relaxed">
        <GlossaryTooltip text={data.text} glossary={glossary} searchQuery={searchQuery} />
      </p>
    </motion.div>
  )
}

export function DiagramRenderer({ data, searchQuery }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <pre
        className="rounded-xl p-5 text-xs md:text-sm leading-relaxed overflow-x-auto font-mono"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-dim)'
        }}
      >
        <HighlightedText text={data.text} searchQuery={searchQuery} />
      </pre>
    </motion.div>
  )
}

export function ContentBlock({ block, glossary, searchQuery, preview = false }) {
  // In preview mode, truncate large table data
  const data = preview && block.type === 'table' && block.rows?.length > 3
    ? { ...block, rows: block.rows.slice(0, 3), _truncated: block.rows.length }
    : block

  switch (block.type) {
    case 'table':
      return (
        <>
          <TableRenderer data={data} glossary={glossary} searchQuery={searchQuery} />
          {data._truncated && (
            <div className="text-xs text-text-muted mt-1 pl-1">
              ...还有 {data._truncated - 3} 行
            </div>
          )}
        </>
      )
    case 'stats':
      return <StatsRenderer data={block} searchQuery={searchQuery} />
    case 'trends':
      return <TrendsRenderer data={block} glossary={glossary} searchQuery={searchQuery} />
    case 'cards':
      return <CardsRenderer data={block} glossary={glossary} searchQuery={searchQuery} />
    case 'note':
      return <NoteRenderer data={block} glossary={glossary} searchQuery={searchQuery} />
    case 'diagram':
      return <DiagramRenderer data={block} searchQuery={searchQuery} />
    default:
      return null
  }
}
