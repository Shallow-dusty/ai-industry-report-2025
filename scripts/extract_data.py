#!/usr/bin/env python3
"""[DEPRECATED] Extract structured data from index.html into JSON for React migration.
This script was used during the initial migration from static HTML to React.
It is no longer needed as data is now maintained directly in report.json.
"""

import json
import re
from pathlib import Path


def clean_html(text):
    """Remove HTML tags, decode entities, preserve glossary markers."""
    text = re.sub(r'<abbr[^>]*class="glossary-term"[^>]*>([^<]*)</abbr>', r'⟦\1⟧', text)
    text = re.sub(r'<abbr[^>]*>([^<]*)</abbr>', r'\1', text)
    text = re.sub(r'<strong>(.*?)</strong>', r'\1', text)
    text = re.sub(r'<sup>(.*?)</sup>', r'^\1', text)
    text = re.sub(r'<br\s*/?>', ' ', text)
    text = re.sub(r'<[^>]+>', '', text)
    # Decode entities
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&rarr;', '→').replace('&harr;', '↔')
    text = text.replace('&times;', '×').replace('&middot;', '·')
    return text.strip()


def extract_glossary(html):
    """Extract all glossary terms from abbr tags."""
    glossary = {}
    for m in re.finditer(r'<abbr\s+title="([^"]*)"[^>]*class="glossary-term"', html):
        term_match = re.search(r'>([^<]*)</abbr>', html[m.start():m.start()+200])
        if term_match:
            glossary[term_match.group(1)] = m.group(1)
    return glossary


def extract_table(table_html):
    """Extract a single table into structured data."""
    headers = []
    thead = re.search(r'<thead>(.*?)</thead>', table_html, re.DOTALL)
    if thead:
        headers = [clean_html(h) for h in re.findall(r'<th>(.*?)</th>', thead.group(1), re.DOTALL)]

    rows = []
    tbody = re.search(r'<tbody>(.*?)</tbody>', table_html, re.DOTALL)
    if tbody:
        for tr in re.finditer(r'<tr>(.*?)</tr>', tbody.group(1), re.DOTALL):
            cells = [clean_html(td) for td in re.findall(r'<td>(.*?)</td>', tr.group(1), re.DOTALL)]
            if cells:
                rows.append(cells)
    return headers, rows


def extract_stats_grid(grid_html):
    """Extract stats from a stats-grid div."""
    stats = []
    for m in re.finditer(r'<div class="stat\s*([^"]*)">\s*<div class="value">(.*?)</div>\s*<div class="label">(.*?)</div>', grid_html, re.DOTALL):
        color_cls = m.group(1).strip()
        color = 'accent'
        for c in ['green', 'blue', 'orange', 'pink']:
            if c in color_cls:
                color = c
                break
        stats.append({
            'value': clean_html(m.group(2)),
            'label': clean_html(m.group(3)),
            'color': color
        })
    return stats


def extract_cards(grid_html):
    """Extract cards from a card-grid div."""
    cards = []
    for m in re.finditer(r'<div class="card"><h4>(.*?)</h4><p>(.*?)</p></div>', grid_html, re.DOTALL):
        cards.append({
            'title': clean_html(m.group(1)),
            'text': clean_html(m.group(2))
        })
    return cards


def extract_trends(block_html):
    """Extract trend items."""
    trends = []
    for m in re.finditer(
        r'<div class="trend-item">\s*<div class="trend-num">(\d+)</div>\s*<div class="trend-content">\s*<h4>(.*?)</h4>\s*<p>(.*?)</p>',
        block_html, re.DOTALL
    ):
        trends.append({
            'num': int(m.group(1)),
            'title': clean_html(m.group(2)),
            'description': clean_html(m.group(3))
        })
    return trends


def extract_report(html):
    """Main extraction function."""

    glossary = extract_glossary(html)
    chapters = []

    # Find positions of each chapter
    ch_positions = [(m.start(), m.group(1)) for m in re.finditer(r'<div class="chapter" id="(ch\d+)">', html)]
    main_end = html.find('</main>')

    if ch_positions:

        for i, (pos, ch_id) in enumerate(ch_positions):
            end_pos = ch_positions[i+1][0] if i+1 < len(ch_positions) else main_end
            block = html[pos:end_pos]

            # Chapter title
            title_match = re.search(r'<h2>.*?<span class="chapter-num">\d+</span>\s*(.*?)</h2>', block, re.DOTALL)
            title = clean_html(title_match.group(1)) if title_match else ch_id

            chapter = {
                'id': ch_id,
                'title': title,
                'sections': []
            }

            # Find all section blocks
            section_positions = [m.start() for m in re.finditer(r'<div class="section">', block)]

            for j, sec_start in enumerate(section_positions):
                sec_end = section_positions[j+1] if j+1 < len(section_positions) else len(block)
                sec_block = block[sec_start:sec_end]

                # Section title
                sec_title_match = re.search(r'<h3>(.*?)</h3>', sec_block, re.DOTALL)
                sec_title = clean_html(sec_title_match.group(1)) if sec_title_match else ''

                section = {
                    'title': sec_title,
                    'content': []
                }

                # Process content within section
                # Split by h4 to track subtitles
                # Find all h4 positions
                h4s = list(re.finditer(r'<h4>(.*?)</h4>', sec_block, re.DOTALL))

                # Find all content elements and their positions
                elements = []

                # Tables
                for m in re.finditer(r'<div class="table-wrap"><table>(.*?)</table></div>', sec_block, re.DOTALL):
                    headers, rows = extract_table(m.group(1))
                    # Find preceding h4
                    subtitle = None
                    for h4 in h4s:
                        if h4.end() < m.start():
                            subtitle = clean_html(h4.group(1))
                    elements.append((m.start(), {
                        'type': 'table',
                        'subtitle': subtitle,
                        'headers': headers,
                        'rows': rows
                    }))

                # Also try tables without table-wrap
                for m in re.finditer(r'(?<!table-wrap">)<table>(.*?)</table>', sec_block, re.DOTALL):
                    if not any(abs(m.start() - e[0]) < 50 for e in elements):
                        headers, rows = extract_table(m.group(1))
                        subtitle = None
                        for h4 in h4s:
                            if h4.end() < m.start():
                                subtitle = clean_html(h4.group(1))
                        elements.append((m.start(), {
                            'type': 'table',
                            'subtitle': subtitle,
                            'headers': headers,
                            'rows': rows
                        }))

                # Stats grids
                for m in re.finditer(r'<div class="stats-grid">(.*?)\n</div>', sec_block, re.DOTALL):
                    stats = extract_stats_grid(m.group(1))
                    if stats:
                        elements.append((m.start(), {'type': 'stats', 'items': stats}))

                # Card grids
                for m in re.finditer(r'<div class="card-grid">(.*?)\n</div>', sec_block, re.DOTALL):
                    cards = extract_cards(m.group(1))
                    if cards:
                        elements.append((m.start(), {'type': 'cards', 'items': cards}))

                # Notes
                for m in re.finditer(r'<div class="note">(.*?)</div>', sec_block, re.DOTALL):
                    text = clean_html(m.group(1))
                    if text:
                        elements.append((m.start(), {'type': 'note', 'text': text}))

                # Diagrams
                for m in re.finditer(r'<div class="diagram"><pre>(.*?)</pre></div>', sec_block, re.DOTALL):
                    elements.append((m.start(), {
                        'type': 'diagram',
                        'text': m.group(1).replace('&amp;', '&')
                    }))

                # Trends
                trends = extract_trends(sec_block)
                if trends:
                    elements.append((0, {'type': 'trends', 'items': trends}))

                # Sort by position and add to section
                elements.sort(key=lambda x: x[0])
                section['content'] = [e[1] for e in elements]

                chapter['sections'].append(section)

            # Handle chapters without explicit sections (Ch6)
            if not chapter['sections']:
                section = {'title': title, 'content': []}
                # Direct table
                for m in re.finditer(r'<table>(.*?)</table>', block, re.DOTALL):
                    headers, rows = extract_table(m.group(1))
                    section['content'].append({
                        'type': 'table',
                        'headers': headers,
                        'rows': rows
                    })
                # Direct trends
                trends = extract_trends(block)
                if trends:
                    section['content'].append({'type': 'trends', 'items': trends})
                # Direct stats
                for m in re.finditer(r'<div class="stats-grid">(.*?)\n</div>', block, re.DOTALL):
                    stats = extract_stats_grid(m.group(1))
                    if stats:
                        section['content'].append({'type': 'stats', 'items': stats})
                if section['content']:
                    chapter['sections'].append(section)

            chapters.append(chapter)

    return chapters, glossary


def main():
    script_dir = Path(__file__).resolve().parent.parent
    with open(script_dir / 'index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    chapters, glossary = extract_report(html)

    # Count data points
    total_rows = 0
    total_stats = 0
    total_trends = 0
    total_cards = 0
    total_notes = 0
    total_diagrams = 0
    for ch in chapters:
        for sec in ch['sections']:
            for content in sec['content']:
                if content['type'] == 'table':
                    total_rows += len(content['rows'])
                elif content['type'] == 'stats':
                    total_stats += len(content['items'])
                elif content['type'] == 'trends':
                    total_trends += len(content['items'])
                elif content['type'] == 'cards':
                    total_cards += len(content['items'])
                elif content['type'] == 'note':
                    total_notes += 1
                elif content['type'] == 'diagram':
                    total_diagrams += 1

    print(f"Extracted: {len(chapters)} chapters")
    for ch in chapters:
        sec_count = len(ch['sections'])
        print(f"  {ch['id']}: {ch['title']} ({sec_count} sections)")
        for sec in ch['sections']:
            types = [c['type'] for c in sec['content']]
            print(f"    - {sec['title']}: {types}")
    print(f"\n  Table rows: {total_rows}")
    print(f"  Stats: {total_stats}")
    print(f"  Trends: {total_trends}")
    print(f"  Cards: {total_cards}")
    print(f"  Notes: {total_notes}")
    print(f"  Diagrams: {total_diagrams}")
    print(f"  Glossary: {len(glossary)} terms")

    result = {
        'chapters': chapters,
        'glossary': glossary
    }

    outpath = script_dir / 'src' / 'data' / 'report.json'
    with open(outpath, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nWritten to {outpath}")


if __name__ == '__main__':
    main()
