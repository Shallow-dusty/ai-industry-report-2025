import re

GLOSSARY = {
    "MoE": "混合专家模型，稀疏激活参数提升效率",
    "MLA": "Multi-head Latent Attention，大幅优化 KV 缓存",
    "Stargate": "5000亿美元超算基建",
    "ARR": "年度经常性收入",
    "GRPO": "DeepSeek 首创的无评论者强化学习算法",
    "GPQA": "衡量专家级知识能力的硬核基准",
    "SWE-bench": "衡量 AI 解决真实 GitHub Issue 的基准"
}

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 提取正文内容（去除旧的 header 和 footer）
main_content = re.search(r'<main class="container">(.*?)</main>', html, re.DOTALL).group(1)

# 为正文中的术语添加悬停提示
for term, desc in GLOSSARY.items():
    main_content = main_content.replace(term, f'<abbr title="{desc}" class="glossary-term">{term}</abbr>')

new_template = f"""<!DOCTYPE html>
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
            background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, sans-serif;
            margin: 0; display: flex; height: 100vh; overflow: hidden;
        }}
        .sidebar {{
            width: 260px; background: #0a0a0c; border-right: 1px solid #1e293b;
            padding: 2rem 1.5rem; display: flex; flex-direction: column;
        }}
        .main-view {{
            flex: 1; overflow-y: auto; padding: 3rem 5rem; scroll-behavior: smooth;
        }}
        .search-bar {{
            position: sticky; top: -1px; background: var(--bg); z-index: 100;
            padding: 1rem 0; margin-bottom: 2rem; border-bottom: 1px solid #1e293b;
        }}
        input {{
            width: 100%; background: var(--card); border: 1px solid #334155;
            color: white; padding: 12px 20px; border-radius: 12px; outline: none; transition: 0.3s;
        }}
        input:focus {{ border-color: var(--accent); box-shadow: 0 0 15px rgba(99,102,241,0.2); }}
        .glossary-term {{
            text-decoration: underline dotted var(--accent); cursor: help; color: inherit;
        }}
        .chapter {{ margin-bottom: 6rem; }}
        table {{ width: 100%; border-collapse: separate; border-spacing: 0 8px; }}
        td, th {{ padding: 16px; background: var(--card); text-align: left; }}
        th {{ background: transparent; color: var(--dim); font-size: 12px; text-transform: uppercase; }}
        td:first-child {{ border-radius: 12px 0 0 12px; }}
        td:last-child {{ border-radius: 0 12px 12px 0; }}
        tr:hover td {{ background: #16161e; }}
        .nav-link {{
            color: var(--dim); text-decoration: none; padding: 10px; border-radius: 8px;
            margin-bottom: 5px; transition: 0.2s; font-size: 14px;
        }}
        .nav-link:hover {{ background: #1e1e26; color: white; }}
        @media (max-width: 900px) {{ .sidebar {{ display: none; }} .main-view {{ padding: 2rem; }} }}
    </style>
</head>
<body>
    <aside class="sidebar">
        <div style="font-weight:800; font-size: 1.2rem; color: var(--accent); margin-bottom: 3rem;">PRISM INTEL</div>
        <nav id="nav-list"></nav>
    </aside>
    <main class="main-view">
        <div class="search-bar">
            <input type="text" id="global-search" placeholder="即时搜索全量调研数据 (模型、日期、事件...)" oninput="doSearch()">
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
                const hasVisible = ch.querySelector('tr[style="display: \'\"]') || ch.querySelector('tr:not([style*="none"])');
                ch.style.display = hasVisible ? '' : 'none';
            }});
        }}
        // 自动提取目录
        const headers = document.querySelectorAll('h2');
        const nav = document.getElementById('nav-list');
        headers.forEach((h, i) => {{
            const id = 'section-' + i;
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
    f.write(new_template)
