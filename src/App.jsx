import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Zap, Link, Shield, Globe, Clock, TrendingUp,
  Search, Menu, X, ChevronRight, ChevronLeft, Sparkles,
  ArrowUp, LayoutDashboard, BookOpen, Database, BarChart3,
  FileText, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronUp
} from 'lucide-react'
import reportData from './data/report.json'
import { ContentBlock } from './ContentRenderers'
import { HighlightedText } from './GlossaryTooltip'
import { colorMap, colorBgMap } from './theme'

/* ────────── Constants ────────── */

const chapterIcons = {
  ch1: Cpu, ch2: Zap, ch3: Link, ch4: Shield,
  ch5: Globe, ch6: Clock, ch7: TrendingUp
}
const chapterColors = {
  ch1: 'accent', ch2: 'green', ch3: 'blue', ch4: 'orange',
  ch5: 'pink', ch6: 'accent', ch7: 'green'
}

const { chapters, glossary } = reportData

const dashboardCards = [
  { title: 'DeepSeek 冲击波', value: '~$558 万', desc: 'R1 训练成本震动全行业', color: 'accent', span: 2 },
  { title: 'Claude Code ARR', value: '~10-20 亿$', desc: 'GA 仅 6 个月突破 10 亿', color: 'green', span: 1 },
  { title: '全球 AI 投资', value: '2023 亿$', desc: '占全球 VC 约 50%', color: 'blue', span: 1 },
  { title: 'ChatGPT 用户', value: '8-9 亿', desc: '周活跃用户', color: 'orange', span: 1 },
  { title: 'MCP 生态', value: '10,000+', desc: '活跃服务器, 9700万+ SDK 月下载', color: 'pink', span: 1 },
  { title: 'Stargate 项目', value: '5000 亿$', desc: 'AI 超算基建投资', color: 'accent', span: 2 }
]

const searchFilterOptions = [
  { key: 'all', label: '全部' },
  { key: 'table', label: '表格' },
  { key: 'stats', label: '统计' },
  { key: 'trends', label: '趋势' },
  { key: 'note', label: '备注' }
]

/* ────────── Helpers ────────── */

function getSearchableText(block) {
  const texts = []
  if (block.type === 'table') {
    if (block.subtitle) texts.push(block.subtitle)
    block.headers?.forEach(h => texts.push(h))
    block.rows?.forEach(row => row.forEach(cell => texts.push(cell)))
  } else if (block.type === 'stats') {
    block.items?.forEach(item => { texts.push(item.value); texts.push(item.label) })
  } else if (block.type === 'trends') {
    block.items?.forEach(item => { texts.push(item.title); texts.push(item.description) })
  } else if (block.type === 'cards') {
    block.items?.forEach(item => { texts.push(item.title); texts.push(item.text) })
  } else if (block.type === 'note') {
    texts.push(block.text)
  } else if (block.type === 'diagram') {
    texts.push(block.text)
  }
  return texts.join(' ')
}

function getChapterStats(ch) {
  let dataRows = 0, statItems = 0, sections = ch.sections.length
  ch.sections.forEach(sec => sec.content.forEach(block => {
    if (block.type === 'table') dataRows += block.rows?.length || 0
    else if (block.type === 'stats') statItems += block.items?.length || 0
    else if (block.type === 'trends') statItems += block.items?.length || 0
    else if (block.type === 'cards') statItems += block.items?.length || 0
  }))
  return { sections, dataRows, statItems }
}

/* ────────── Collapsible wrapper for content blocks ────────── */

function CollapsibleBlock({ block, glossary, searchQuery, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const isLarge = block.type === 'table' && (block.rows?.length || 0) > 8

  if (!isLarge) {
    return <ContentBlock block={block} glossary={glossary} searchQuery={searchQuery} />
  }

  return (
    <div>
      <ContentBlock
        block={block}
        glossary={glossary}
        searchQuery={searchQuery}
        preview={!open}
      />
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 mt-2 transition-colors"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {open ? '收起' : `展开全部 ${block.rows.length} 行`}
      </button>
    </div>
  )
}

/* ────────── Main App ────────── */

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const [searchFilter, setSearchFilter] = useState('all')

  const mainRef = useRef(null)
  const debounceRef = useRef(null)
  const sectionRefs = useRef({})

  // M5: cleanup debounce on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Cmd+K search shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('prism-search')?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedQuery('')
    setSearchFilter('all')
    clearTimeout(debounceRef.current)
  }, [])

  const navigateTo = useCallback((view) => {
    setActiveView(view)
    setSidebarOpen(false)
    setActiveSection(0)
    mainRef.current?.scrollTo({ top: 0 })
  }, [])

  // Track scroll progress
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      setScrollProgress(scrollTop / (scrollHeight - clientHeight) || 0)
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // IntersectionObserver for active section tracking in reader mode
  const currentChapter = chapters.find(ch => ch.id === activeView)
  const currentChapterIndex = chapters.findIndex(ch => ch.id === activeView)

  useEffect(() => {
    if (!currentChapter) return
    const root = mainRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.si)
            if (!isNaN(idx)) setActiveSection(idx)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', root }
    )

    // Observe all section elements
    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [activeView, currentChapter])

  // Search
  const isSearching = debouncedQuery.trim().length > 0

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    const q = debouncedQuery.toLowerCase()
    const results = []
    chapters.forEach(ch => {
      ch.sections.forEach(sec => {
        const titleMatch = sec.title.toLowerCase().includes(q)
        sec.content.forEach((block, bi) => {
          if (searchFilter !== 'all' && block.type !== searchFilter) return
          const text = getSearchableText(block)
          if (titleMatch || text.toLowerCase().includes(q)) {
            results.push({
              chapterId: ch.id, chapterTitle: ch.title,
              sectionTitle: sec.title, block, blockIndex: bi
            })
          }
        })
      })
    })
    return results
  }, [debouncedQuery, searchFilter])

  const groupedResults = useMemo(() => {
    const groups = {}
    searchResults.forEach(r => {
      if (!groups[r.chapterId]) {
        groups[r.chapterId] = { chapterTitle: r.chapterTitle, chapterId: r.chapterId, items: [] }
      }
      groups[r.chapterId].items.push(r)
    })
    return Object.values(groups)
  }, [searchResults])

  const totalStats = useMemo(() => {
    let tables = 0, stats = 0, trends = 0
    chapters.forEach(ch => ch.sections.forEach(sec => sec.content.forEach(block => {
      if (block.type === 'table') tables += block.rows?.length || 0
      else if (block.type === 'stats') stats += block.items?.length || 0
      else if (block.type === 'cards') stats += block.items?.length || 0
      else if (block.type === 'trends') trends += block.items?.length || 0
    })))
    return { tables, stats, trends }
  }, [])

  const sidebarW = sidebarCollapsed ? 64 : 280
  const isInChapter = !!currentChapter && !isSearching

  return (
    <div className="h-screen flex overflow-hidden">
      {/* ═══════════ Mobile overlay ═══════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══════════ Sidebar ═══════════ */}
      <aside
        className={`
          fixed lg:static z-40 h-full flex-shrink-0 flex flex-col
          transition-all duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: sidebarOpen ? 280 : sidebarW,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)'
        }}
      >
        {/* Branding */}
        <div className="p-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => navigateTo('dashboard')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity overflow-hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-dim)' }}>
              <Sparkles size={16} className="text-accent" />
            </div>
            {!sidebarCollapsed && (
              <div className="whitespace-nowrap">
                <div className="text-sm font-bold tracking-wider">PRISM<span className="text-accent">.INTEL</span></div>
                <div className="text-[10px] text-text-muted tracking-wide">2025-2026 AI REPORT</div>
              </div>
            )}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex text-text-muted hover:text-text p-1 rounded transition-colors"
              aria-label={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-text-muted hover:text-text p-1"
              aria-label="关闭导航菜单"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {/* Dashboard button */}
          <SidebarItem
            icon={LayoutDashboard}
            label="总览"
            active={activeView === 'dashboard' && !isSearching}
            collapsed={sidebarCollapsed}
            onClick={() => navigateTo('dashboard')}
          />

          {/* Separator */}
          {!sidebarCollapsed && (
            <div className="text-[10px] uppercase tracking-widest text-text-muted px-3 mt-3 mb-1">Chapters</div>
          )}
          {sidebarCollapsed && <div className="border-t border-border mx-2 my-2" />}

          {/* Chapter list */}
          {chapters.map(ch => {
            const Icon = chapterIcons[ch.id] || Cpu
            const isActive = activeView === ch.id && !isSearching
            return (
              <SidebarItem
                key={ch.id}
                icon={Icon}
                label={ch.title}
                active={isActive}
                collapsed={sidebarCollapsed}
                onClick={() => { clearSearch(); navigateTo(ch.id) }}
              />
            )
          })}

          {/* Section TOC in reader mode (only when sidebar is expanded and in chapter view) */}
          {isInChapter && !sidebarCollapsed && (
            <>
              <div className="border-t border-border mx-2 my-3" />
              <div className="text-[10px] uppercase tracking-widest text-text-muted px-3 mb-1">Sections</div>
              {currentChapter.sections.map((sec, si) => (
                <button
                  key={si}
                  onClick={() => {
                    const el = sectionRefs.current[si]
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`
                    w-full text-left px-3 py-1.5 rounded-md mb-0.5 text-xs transition-all duration-200 truncate
                    ${activeSection === si
                      ? 'text-accent bg-accent-dim'
                      : 'text-text-muted hover:text-text-dim hover:bg-white/[0.03]'}
                  `}
                  aria-current={activeSection === si ? 'true' : undefined}
                >
                  {sec.title}
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Quick stats */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-accent">{totalStats.tables}</div>
                <div className="text-[10px] text-text-muted">数据行</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green">{totalStats.stats}</div>
                <div className="text-[10px] text-text-muted">统计项</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange">{totalStats.trends}</div>
                <div className="text-[10px] text-text-muted">趋势</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ═══════════ Main Content ═══════════ */}
      <main ref={mainRef} className="flex-1 overflow-y-auto relative">
        {/* Scroll progress (H3 fix: not covering sidebar) */}
        <div className="sticky top-0 z-30 h-0.5">
          <div
            className="h-full transition-all duration-150"
            style={{
              width: `${scrollProgress * 100}%`,
              background: 'linear-gradient(90deg, var(--color-accent), var(--color-blue), var(--color-pink))',
              boxShadow: scrollProgress > 0
                ? '0 0 12px rgba(99, 102, 241, 0.6), 0 0 4px rgba(59, 130, 246, 0.4)'
                : 'none'
            }}
          />
        </div>

        {/* Sticky header */}
        <div
          className="sticky top-0.5 z-20 px-4 md:px-8 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-muted hover:text-text p-1"
            aria-label="打开导航菜单"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          {isInChapter && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="hidden md:flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors mr-2"
            >
              <LayoutDashboard size={12} />
              <span>总览</span>
              <ChevronRight size={12} />
            </button>
          )}

          {/* Search */}
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              id="prism-search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索报告内容... (⌘K)"
              aria-label="搜索报告内容"
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-card border border-border text-text
                placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
                transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                aria-label="清除搜索"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {isSearching && (
            <span className="text-xs text-text-muted hidden md:block whitespace-nowrap">
              {searchResults.length} 条结果
            </span>
          )}

          {/* View mode indicator */}
          {isInChapter && (
            <div className="hidden md:flex items-center gap-1 text-text-muted">
              <BookOpen size={14} className="text-accent" />
              <span className="text-xs">阅读模式</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ────── SEARCH VIEW ────── */}
            {isSearching && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Search size={20} className="text-accent" />
                  <h2 className="text-lg font-bold">
                    搜索结果 <span className="text-text-muted font-normal text-sm ml-2">"{searchQuery}"</span>
                  </h2>
                </div>

                {/* Type filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchFilterOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSearchFilter(opt.key)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200
                        ${searchFilter === opt.key
                          ? 'border-accent/60 text-accent bg-accent-dim'
                          : 'border-border text-text-muted hover:text-text hover:border-accent/30'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {groupedResults.length === 0 ? (
                  <div className="text-center py-20 text-text-muted">
                    <Search size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">没有找到匹配的内容</p>
                    <p className="text-xs mt-1">试试其他关键词或切换过滤类型</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {groupedResults.map(group => {
                      const Icon = chapterIcons[group.chapterId] || Cpu
                      return (
                        <div key={group.chapterId}>
                          <button
                            onClick={() => { clearSearch(); navigateTo(group.chapterId) }}
                            className="flex items-center gap-2 mb-3 group"
                          >
                            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ background: 'var(--color-accent-dim)' }}>
                              <Icon size={14} className="text-accent" />
                            </div>
                            <span className="text-sm font-semibold group-hover:text-accent transition-colors">
                              {group.chapterTitle}
                            </span>
                            <span className="text-xs text-text-muted">{group.items.length} 条匹配</span>
                            <ChevronRight size={14} className="text-text-muted group-hover:text-accent transition-colors" />
                          </button>
                          <div className="space-y-3 pl-9">
                            {group.items.slice(0, 3).map((item, i) => (
                              <div
                                key={i}
                                className="rounded-lg p-3 cursor-pointer hover:bg-card-hover transition-colors"
                                style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
                                onClick={() => { clearSearch(); navigateTo(item.chapterId) }}
                              >
                                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">
                                  {item.sectionTitle}
                                </div>
                                <ContentBlock block={item.block} glossary={glossary} searchQuery={debouncedQuery} preview />
                              </div>
                            ))}
                            {group.items.length > 3 && (
                              <button
                                onClick={() => { clearSearch(); navigateTo(group.chapterId) }}
                                className="text-xs text-accent hover:text-accent/80 transition-colors pl-1"
                              >
                                查看全部 {group.items.length} 条 →
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ────── DASHBOARD VIEW (Bento Grid) ────── */}
            {!isSearching && activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              >
                {/* Hero */}
                <div className="mb-8 relative">
                  {/* Ambient orbs */}
                  <div className="ambient-orb ambient-orb-1" />
                  <div className="ambient-orb ambient-orb-2" />
                  <div className="ambient-orb ambient-orb-3" />

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3 font-heading"
                  >
                    AI 行业全景<span className="glow-text">战略研判</span>
                  </motion.h1>
                  <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
                    className="h-px w-32 mb-3 origin-left"
                    style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }}
                  />
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    className="text-sm text-text-dim max-w-2xl relative z-10"
                  >
                    涵盖 2025-2026 年 AI 行业关键数据、模型竞赛、协议标准、安全法规、
                    产业投资和战略趋势的全景式研究报告。
                  </motion.p>
                </div>

                {/* ── Bento Grid: Key Figures ── */}
                <div className="mb-10">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                    <BarChart3 size={10} /> Key Figures
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {dashboardCards.map((card, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass-elevated shimmer-border rounded-xl p-4 hover:scale-[1.02] transition-all duration-300
                          ${card.span === 2 ? 'md:col-span-2' : ''}`}
                        style={{ borderColor: `${colorMap[card.color]}15` }}
                      >
                        <div className="text-xs text-text-muted mb-1 font-heading">{card.title}</div>
                        <div className="text-xl md:text-2xl font-extrabold tracking-tight mb-0.5 font-heading"
                          style={{ color: colorMap[card.color] }}>
                          {card.value}
                        </div>
                        <div className="text-xs text-text-dim">{card.desc}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* ── Chapter Cards Grid ── */}
                <div className="mb-10">
                  <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                    <BookOpen size={10} /> Explore Chapters
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {chapters.map((ch, i) => {
                      const Icon = chapterIcons[ch.id] || Cpu
                      const color = chapterColors[ch.id] || 'accent'
                      const stats = getChapterStats(ch)
                      return (
                        <motion.button
                          key={ch.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 + i * 0.04 }}
                          onClick={() => navigateTo(ch.id)}
                          className="glass-elevated shimmer-border rounded-xl p-5 text-left hover:scale-[1.02] transition-all duration-300 group"
                          style={{ borderColor: `${colorMap[color]}15` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ background: colorBgMap[color] }}>
                              <Icon size={20} style={{ color: colorMap[color] }} />
                            </div>
                            <ChevronRight size={16}
                              className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <h3 className="font-bold text-sm mb-1.5 group-hover:text-accent transition-colors font-heading">
                            {ch.title}
                          </h3>
                          <div className="flex items-center gap-3 text-[11px] text-text-muted">
                            <span className="flex items-center gap-1"><FileText size={10} />{stats.sections} 节</span>
                            {stats.dataRows > 0 && (
                              <span className="flex items-center gap-1"><Database size={10} />{stats.dataRows} 行</span>
                            )}
                            {stats.statItems > 0 && (
                              <span className="flex items-center gap-1"><BarChart3 size={10} />{stats.statItems} 项</span>
                            )}
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-text-muted py-8 border-t border-border">
                  <p>PRISM.INTEL | AI Industry Strategic Intelligence Report</p>
                  <p className="mt-1">Built with React + Tailwind CSS + Framer Motion</p>
                </div>
              </motion.div>
            )}

            {/* ────── CHAPTER / READER VIEW ────── */}
            {isInChapter && (() => {
              const ChIcon = chapterIcons[currentChapter.id] || Cpu
              const chColor = chapterColors[currentChapter.id] || 'accent'
              return (
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                >
                  {/* Chapter header */}
                  <div className="mb-8 relative">
                    {/* Decorative gradient bg */}
                    <div
                      className="absolute -top-6 -left-8 w-64 h-32 rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(circle, ${colorMap[chColor]}15, transparent 70%)`,
                        filter: 'blur(40px)'
                      }}
                    />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: colorBgMap[chColor] }}>
                        <ChIcon size={22} style={{ color: colorMap[chColor] }} />
                      </div>
                      <div>
                        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight font-heading">
                          {currentChapter.title}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                          <span>{currentChapter.sections.length} 个小节</span>
                          <span>第 {currentChapterIndex + 1}/{chapters.length} 章</span>
                        </div>
                      </div>
                    </div>

                    {/* Section quick-jump pills */}
                    {currentChapter.sections.length > 1 && (
                      <div className="flex flex-wrap gap-2">
                        {currentChapter.sections.map((sec, si) => (
                          <button
                            key={si}
                            onClick={() => {
                              sectionRefs.current[si]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200
                              ${activeSection === si
                                ? 'border-accent/60 text-accent bg-accent-dim'
                                : 'border-border text-text-dim hover:border-accent/40 hover:text-accent hover:bg-accent-dim'}`}
                          >
                            {sec.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sections */}
                  {currentChapter.sections.map((sec, si) => (
                    <div
                      key={si}
                      ref={el => { sectionRefs.current[si] = el }}
                      data-si={si}
                      className="mb-10 scroll-mt-20"
                    >
                      <motion.h3
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                        className="text-base font-semibold mb-4 pb-2 border-b border-border text-text-dim font-heading flex items-center gap-2"
                      >
                        <div
                          className="w-1 h-4 rounded-full"
                          style={{
                            background: colorMap[chColor],
                            boxShadow: `0 0 6px ${colorMap[chColor]}40`
                          }}
                        />
                        {sec.title}
                      </motion.h3>
                      <div className="space-y-4">
                        {sec.content.map((block, bi) => (
                          <CollapsibleBlock key={bi} block={block} glossary={glossary} searchQuery="" />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Prev / Next */}
                  <div className="flex items-center justify-between pt-6 mt-8 border-t border-border">
                    {currentChapterIndex > 0 ? (
                      <button
                        onClick={() => navigateTo(chapters[currentChapterIndex - 1].id)}
                        className="flex items-center gap-2 text-sm text-text-dim hover:text-accent transition-colors group"
                      >
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        <div className="text-left">
                          <div className="text-[10px] text-text-muted">上一章</div>
                          <div className="font-medium">{chapters[currentChapterIndex - 1].title}</div>
                        </div>
                      </button>
                    ) : <div />}
                    <button
                      onClick={() => navigateTo('dashboard')}
                      className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
                    >
                      <LayoutDashboard size={12} /> 返回总览
                    </button>
                    {currentChapterIndex < chapters.length - 1 ? (
                      <button
                        onClick={() => navigateTo(chapters[currentChapterIndex + 1].id)}
                        className="flex items-center gap-2 text-sm text-text-dim hover:text-accent transition-colors group"
                      >
                        <div className="text-right">
                          <div className="text-[10px] text-text-muted">下一章</div>
                          <div className="font-medium">{chapters[currentChapterIndex + 1].title}</div>
                        </div>
                        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : <div />}
                  </div>

                  <div className="text-center text-xs text-text-muted py-8 mt-8">
                    <p>PRISM.INTEL | AI Industry Strategic Intelligence Report</p>
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>

        {/* Back to top */}
        <AnimatePresence>
          {scrollProgress > 0.05 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-30 w-10 h-10 rounded-full flex items-center justify-center
                shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer"
              style={{
                background: 'var(--color-accent)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
              aria-label="返回顶部"
            >
              <ArrowUp size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ────────── Sidebar Item Component ────────── */

function SidebarItem({ icon: Icon, label, active, collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg mb-1 flex items-center transition-all duration-200 text-sm relative
        ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5 gap-3'}
        ${active ? 'text-white' : 'text-text-dim hover:text-text hover:bg-white/[0.04]'}
      `}
      style={active ? {
        background: 'var(--color-accent-dim)',
        boxShadow: 'inset 0 0 0 1px rgba(99, 102, 241, 0.2)'
      } : {}}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      {/* Active glow indicator */}
      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
          style={{
            background: 'var(--color-accent)',
            boxShadow: '0 0 8px var(--color-accent-glow), 2px 0 12px var(--color-accent-dim)'
          }}
        />
      )}
      <Icon size={16} className={`flex-shrink-0 ${active ? 'text-accent' : ''}`} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && active && <ChevronRight size={14} className="ml-auto text-accent" />}
    </button>
  )
}
