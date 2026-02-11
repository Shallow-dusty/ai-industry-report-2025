import re, os

GLOSSARY = {
    "MoE": "混合专家模型，稀疏激活参数提升效率",
    "MLA": "Multi-head Latent Attention，大幅优化 KV 缓存",
    "Stargate": "5000亿美元超算基建项目",
    "ARR": "年度经常性收入",
    "GRPO": "DeepSeek 首创的无评论者强化学习算法",
    "GPQA": "衡量专家级知识能力的硬核基准",
    "SWE-bench": "衡量 AI 解决真实 GitHub Issue 的基准",
    "SOTA": "业界顶尖水平"
}

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 提取主内容
match = re.search(r'<main class="container">(.*?)</main>', html, re.DOTALL)
main_content = match.group(1) if match else "Content Not Found"

# 注入术语提示 (精准匹配)
for term, desc in GLOSSARY.items():
    main_content = re.sub(rf'\b{term}\b', f'<abbr title="{desc}" class="glossary-term">{term}</abbr>', main_content)

# 注入新样式与搜索逻辑
new_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2026 AI 战略情报平台</title>
    <style>
        :root {{
            --bg: #050505; --card: #0f0f12; --accent: #6366f1; --text: #e2e8f0; --dim: #94a3b8;
        }}
        body {{
            background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0; display: flex; height: 100vh; overflow: hidden;
        }}
        .sidebar {{
            width: 280px; background: #08080a; border-right: 1px solid #1e293b;
            padding: 2.5rem 1.5rem; display: flex; flex-direction: column;
        }}
        .main-view {{
            flex: 1; overflow-y: auto; padding: 0 4rem 4rem; scroll-behavior: smooth;
        }}
        .header-sticky {{
            position: sticky; top: 0; background: var(--bg); z-index: 100;
            padding: 2rem 0 1rem; border-bottom: 1px solid #1e293b; margin-bottom: 3rem;
        }}
        input {{
            width: 100%; background: var(--card); border: 1px solid #334155;
            color: white; padding: 14px 24px; border-radius: 14px; outline: none; transition: 0.3s;
            font-size: 15px;
        }}
        input:focus {{ border-color: var(--accent); box-shadow: 0 0 20px rgba(99,102,241,0.15); }}
        .glossary-term {{
            text-decoration: underline dotted var(--accent); cursor: help; color: inherit;
        }}
        .chapter {{ margin-bottom: 8rem; }}
        .chapter-header h2 {{ font-size: 2.5rem; letter-spacing: -0.03em; color: white; margin-bottom: 2rem; }}
        table {{ width: 100%; border-collapse: separate; border-spacing: 0 10px; }}
        td, th {{ padding: 18px; background: var(--card); text-align: left; vertical-align: top; }}
        th {{ background: transparent; color: var(--dim); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }}
        td:first-child {{ border-radius: 14px 0 0 14px; width: 120px; font-weight: 600; color: var(--accent); }}
        td:last-child {{ border-radius: 0 14px 14px 0; color: #cbd5e1; line-height: 1.6; }}
        tr:hover td {{ background: #16161e; }}
        .nav-link {{
            color: var(--dim); text-decoration: none; padding: 12px 16px; border-radius: 10px;
            margin-bottom: 6px; transition: 0.2s; font-size: 14px; font-weight: 500;
        }}
        .nav-link:hover, .nav-link.active {{ background: #1e1e26; color: white; }}
        .badge {{
            display: inline-block; padding: 4px 12px; border-radius: 99px; background: rgba(99,102,241,0.1);
            color: var(--accent); font-size: 11px; font-weight: 700; margin-bottom: 1rem; border: 1px solid var(--accent);
        }}
        @media (max-width: 1000px) {{ .sidebar {{ display: none; }} .main-view {{ padding: 2rem; }} }}
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="badge">Intelligence 2026</div>
        <div style="font-weight:900; font-size: 1.5rem; color: white; margin-bottom: 3rem; letter-spacing: -1px;">PRISM<span style="color:var(--accent)">.INTEL</span></div>
        <nav id="nav-list" style="display:flex; flex-direction:column;"></nav>
    </aside>
    <main class="main-view">
        <div class="header-sticky">
            <h1 style="font-size: 1.2rem; margin-bottom: 1.5rem;">2025-2026 AI 行业全景战略研判</h1>
            <input type="text" id="global-search" placeholder="输入关键词即时检索 (如 'DeepSeek', '核能', 'Agent')..." oninput="doSearch()">
        </div>
        <div id="content-root">{main_content}</div>
    </main>
    <script>
        function doSearch() {{
            const q = document.getElementById('global-search').value.toLowerCase();
            const rows = document.querySelectorAll('tr');
            rows.forEach(row => {{
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(q) ? '' : 'none';
            }});
            const chapters = document.querySelectorAll('.chapter');
            chapters.forEach(ch => {{
                const visibleRows = ch.querySelectorAll('tr:not([style*="none"])');
                ch.style.display = (visibleRows.length > 1 || q === '') ? '' : 'none';
            }});
        }}
        // 提取目录
        const headers = document.querySelectorAll('h2');
        const nav = document.getElementById('nav-list');
        headers.forEach((h, i) => {{
            const id = 'sec-' + i;
            h.id = id;
            const a = document.createElement('a');
            a.href = '#' + id;
            a.className = 'nav-link';
            a.innerText = h.innerText.replace(/^[0-9\\.\\s]*/, '');
            nav.appendChild(a);
        }});
    </script>
</body>
</html>"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
