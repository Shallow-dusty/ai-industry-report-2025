#!/usr/bin/env node
/**
 * Update Chapter 1 sections 1.1-1.4 with research findings.
 * - Apply corrections to existing entries
 * - Add new core/deep entries with detail field (4th element in row array)
 * - Mark all existing entries with detail level
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportPath = resolve(__dirname, '../src/data/report.json');

const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
const ch1 = report.chapters[0]; // "大模型发布全景时间线"

// Helper: find section by title prefix
function findSection(prefix) {
  return ch1.sections.find(s => s.title.startsWith(prefix));
}

// ═══════════════════════════════════════════════════════
// 1.1 OpenAI
// ═══════════════════════════════════════════════════════
const openai = findSection('1.1');
openai.content[0].rows = [
  ["2025.01.23", "Operator", "浏览器自动化 Agent，基于 CUA 模型。WebArena 58.1%，OSWorld 38.1%。7月并入 ChatGPT Agent，8月下线", "core"],
  ["2025.01.31", "o3-mini", "高效推理模型，对所有 ChatGPT 用户开放（含免费版）。应对 DeepSeek R1 竞争的关键举措", "core"],
  ["2025.02.02", "Deep Research", "基于 o3 的自主研究 Agent，可浏览网页 5-30 分钟生成带引用报告。HLE 26.6%。首发 Pro 用户", "core"],
  ["2025.02.27", "GPT-4.5 Preview", "代号 Orion，最后一个非 CoT 模型。API $75/$150/M tokens。7月14日 API 下线（被 GPT-4.1 取代）", "core"],
  ["2025.03.11", "Responses API + Agents SDK", "新 API 基础设施，替代 Assistants API。开源 Agent SDK，内置 web search / file search / computer use 工具", "core"],
  ["2025.03.25", "GPT-4o 图像生成", "原生图像生成能力，吉卜力风格爆火。首周 1.3 亿用户生成 7 亿张图。API 版 gpt-image-1 4月23日上线", "core"],
  ["2025.04.14", "GPT-4.1 / mini / nano", "三款同发。⟦SWE-bench⟧ Verified 比 GPT-4o 高 21.4 百分点；100 万 token 上下文", "core"],
  ["2025.04.16", "o3 & o4-mini", "o3 ⟦GPQA⟧ Diamond 83.3%；o4-mini AIME 2025 99.5%（使用 Python）。同日开源 Codex CLI", "core"],
  ["2025.05.16", "Codex (codex-1)", "AI 编码 Agent，基于 o3 优化。沙盒云环境，1-30 分钟完成功能开发", "core"],
  ["2025.05.21", "收购 io (Jony Ive)", "$65 亿收购前苹果设计师 Jony Ive 的 AI 硬件公司 io，OpenAI 史上最大收购", "core"],
  ["2025.06.10", "o3-pro", "最可靠推理模型。同日 o3 API 降价 80%（$10/$40 → $2/$8/M tokens）", "core"],
  ["2025.07.17", "ChatGPT Agent", "通用 AI Agent 集成入 ChatGPT，整合 Operator + Deep Research。可浏览网页、执行代码、操作 API", "core"],
  ["2025.08.05", "GPT-OSS (120B/20B)", "自 GPT-2 以来首个开源模型，Apache 2.0，MoE 架构。120B 接近 o4-mini，20B 可在 16GB 设备运行", "core"],
  ["2025.08.07", "GPT-5 / GPT-5 Pro", "年度旗舰。AIME 2025 94.6%，⟦SWE-bench⟧ 74.9%，幻觉率 4.8%（o3 为 22%）。首个统一推理+快速回答模型", "core"],
  ["2025.09.15", "GPT-5-Codex", "GPT-5 编码优化版，可独立工作超 7 小时。9.23 上线 API", "deep"],
  ["2025.09.30", "Sora 2 / Sora 2 Pro", "视频+同步音频生成。API 开放 v1/videos 端点", "core"],
  ["2025.10.06", "DevDay 2025", "发布 GPT-5 Pro API、AgentKit/ChatKit、Apps SDK。宣布 800M 周活用户", "deep"],
  ["2025.11.12", "GPT-5.1", "新增 8 种可定制个性风格、adaptive reasoning。11.19 发布 GPT-5.1-Codex-Max（首个 compaction 编码模型）", "deep"],
  ["2025.12.11", "GPT-5.2 (Instant/Thinking/Pro)", "因 Gemini 3 发布加速推出（内部代号 Code Red）。AIME 2025 100%，财务建模能力显著增强", "core"],
  ["2025.12.18", "GPT-5.2-Codex", "旗舰编码模型，上下文压缩改善长任务处理，新增 Windows 环境。网络安全能力增强", "deep"],
  ["2026.02.05", "GPT-5.3-Codex", "结合 GPT-5.2-Codex 编码 + GPT-5.2 推理，速度提升 25%。首个参与自身训练的模型，首个网络安全 High capability 模型", "core"],
  ["2026.02.12", "GPT-5.3-Codex-Spark", "首个运行在非 Nvidia 硬件（Cerebras WSE-3）的模型，>1000 tokens/s，15x 快于 GPT-5.3-Codex", "core"],
];

// ═══════════════════════════════════════════════════════
// 1.2 Google / DeepMind
// ═══════════════════════════════════════════════════════
const google = findSection('1.2');
google.content[0].rows = [
  ["2025.01.30", "Gemini 2.0 Flash", "成为默认模型。100 万 token 上下文", "core"],
  ["2025.02.05", "Gemini 2.0 Pro (实验版) / Flash-Lite", "Pro 200 万 token 上下文，最强编码（实验版）；Flash-Lite 最高性价比", "deep"],
  ["2025.03.12", "Gemma 3 开源", "首款多模态 Gemma，1B-27B 参数，128K 上下文，140+ 语言，单 GPU 可运行", "core"],
  ["2025.03.25", "Gemini 2.5 Pro (实验版)", "Google 首款 thinking model，LMArena 第一。增强推理和编码", "core"],
  ["2025.04.09", "Cloud Next 2025", "Ironwood TPU v7（4,614 TFLOPS）发布；Agent Development Kit 开源；Agent2Agent 协议", "core"],
  ["2025.05.14", "AlphaEvolve", "通用进化编码 Agent，结合 Gemini + 进化计算。为 Google 节省 0.7% 全球算力，优化下一代 TPU 布局", "core"],
  ["2025.05.20", "Google I/O 2025", "Gemini 4 亿月活；AI Mode 全美开放；Jules 编码 Agent 公测；Stitch UI 工具；Gemini Diffusion 实验", "core"],
  ["2025.05.20", "Veo 3 / Imagen 4 / Lyria 2", "Veo 3 首个视频+原生音频同步生成；Imagen 4 最先进图像生成；Lyria 2 音乐生成", "core"],
  ["2025.06.17", "Gemini 2.5 Pro/Flash GA", "2.5 系列正式商用", "deep"],
  ["2025.06.25", "Gemini CLI 开源", "终端 AI Agent，Apache 2.0，1M token 上下文，60 次/分钟免费。GitHub 85K+ stars", "core"],
  ["2025.10.15", "Veo 3.1", "图到视频过渡、场景延伸（1 分钟+ 视频）", "deep"],
  ["2025.11.18", "Gemini 3 Pro / Deep Think", "20 项基准 19 项领先，HLE 37.5%（Deep Think 41.0%）。⟦SWE-bench⟧ 76.2%。LMArena Elo 1501", "core"],
  ["2025.11.18", "Antigravity IDE", "Agent-first IDE（基于 VS Code），支持多模型、Manager 视图多 Agent 并行。Sergey Brin 回归发布", "core"],
  ["2025.12.17", "Gemini 3 Flash", "替代 2.5 Flash 成为默认", "core"],
  ["2026.01.12", "Apple 合作", "Apple 宣布与 Google 达成多年合作，下一代 Siri 基于 Gemini 模型构建", "core"],
  ["2026.02.12", "Gemini 3 Deep Think 更新", "HLE 48.4%，ARC-AGI-2 84.6%，Codeforces 3455 Elo（传奇大师）。解决 18 个未解研究问题", "core"],
];

// ═══════════════════════════════════════════════════════
// 1.3 Anthropic
// ═══════════════════════════════════════════════════════
const anthropic = findSection('1.3');
anthropic.content[0].rows = [
  ["2025.01", "Claude 3.5 更新", "新版 computer use 工具（hold_key/scroll/wait 等），新增 Citations 引用功能", "deep"],
  ["2025.02.24", "Claude 3.7 Sonnet", "业界首款混合推理模型。⟦SWE-bench⟧ 62.3%（标准）/ 70.3%（extended thinking）。同时发布 Claude Code 预览版", "core"],
  ["2025.03", "Anthropic 融资 $615 亿估值", "$35 亿融资，Lightspeed 领投", "core"],
  ["2025.03.21", "Claude Web Search", "Claude 获得网页搜索能力（Brave Search），首先面向美国付费用户。API 可用 web_search 工具", "core"],
  ["2025.03.27", "Tracing the Thoughts", "归因图方法追踪 LLM 内部推理过程并开源，可解释性里程碑", "deep"],
  ["2025.04.09", "Claude Max 订阅", "新增 $100/月（5x Pro）和 $200/月（20x Pro）高级订阅层", "core"],
  ["2025.05.01", "Integrations + Research", "Claude Integrations 上线（Jira/Confluence/Zapier 等）；Research 模式升级支持 Google Workspace + 深度网页搜索", "core"],
  ["2025.05.22", "Claude Opus 4 & Sonnet 4", "新一代旗舰。Opus 4 \"世界最佳编码模型\"。ASL-3 首次激活。Claude Code GA", "core"],
  ["2025.08.05", "Claude Opus 4.1", "⟦SWE-bench⟧ 74.5%，OSWorld 44.4%。增量更新，后被 Sonnet 4.5 超越", "deep"],
  ["2025.08.27", "Claude for Chrome", "Chrome 浏览器扩展研究预览，初始限 1000 名 Max 用户。可直接控制浏览器完成网页任务", "core"],
  ["2025.09", "Anthropic 融资 $1830 亿估值", "Series F $130 亿，Iconiq/Fidelity/Lightspeed 联合领投", "core"],
  ["2025.09.29", "Claude Sonnet 4.5 + Claude Code 2.0", "⟦SWE-bench⟧ 77.2%，OSWorld 61.4%，可自主运行 30 小时。Code 2.0: VS Code 扩展、Checkpoints、子代理", "core"],
  ["2025.10.15", "Claude Haiku 4.5", "⟦SWE-bench⟧ 73%，$1/$5 定价。匹配 Sonnet 4 编码性能，成为免费用户默认模型", "core"],
  ["2025.11.24", "Claude Opus 4.5", "⟦SWE-bench⟧ 80.9%。定价降 67%（$5/$25）。effort 参数可额外减少 76% token 消耗", "core"],
  ["2025.12.09", "MCP → Linux 基金会", "将 MCP 捐赠给新成立的 Agentic AI Foundation，OpenAI/Google/Microsoft/AWS 为创始成员", "core"],
  ["2026.01.12", "Claude Cowork", "面向非技术用户的 GUI Agent 工具（研究预览），主要由 Claude Code 自身构建", "core"],
  ["2026.02.05", "Claude Opus 4.6", "当前最新旗舰。100 万 token 上下文(beta)，Agent Teams 多代理协作，OSWorld 72.7%，ARC-AGI-2 68.8%", "core"],
  ["2026.02.12", "Anthropic Series G 融资", "$300 亿，估值 $3800 亿。年化收入 $140 亿，Claude Code 年化 $25 亿", "core"],
];

// ═══════════════════════════════════════════════════════
// 1.4 xAI (Elon Musk)
// ═══════════════════════════════════════════════════════
const xai = findSection('1.4');
xai.content[0].rows = [
  ["2025.02.17", "Grok 3 / Grok 3 mini", "Colossus 超算（约 20 万 GPU）训练。Elo 1402。100 万 token 宣称（API 实际 131K）", "core"],
  ["2025.04.09", "Grok 3 API 上线", "开发者可接入。$3/$15 per M tokens，131K 上下文", "core"],
  ["2025.04.29", "Grok 3.5 宣布（跳过）", "Musk 宣布\"下周发布 beta\"但持续跳票。6月确认跳过，直接推进 Grok 4", "deep"],
  ["2025.07.09", "Grok 4 / Grok 4 Heavy", "~1.7 万亿参数 MoE。Grok 4 Heavy AIME'25 95%，HLE 44.4%。$300/月 SuperGrok Heavy 订阅", "core"],
  ["2025.07.12", "Grok 接入 Tesla 车载", "OTA 更新 2025.26 版固件，Model S/3/X/Y/Cybertruck 可使用语音 Grok", "core"],
  ["2025.08.24", "Grok 2.5 开源", "发布在 Hugging Face，约 2700 亿参数。社区许可证（非 OSI 标准开源）", "core"],
  ["2025.09.19", "xAI Series D + Grok 4 Fast", "$100 亿融资，估值 $2000 亿。同日发布 Grok 4 Fast：$0.20/$0.50/M tokens，2M 上下文", "core"],
  ["2025.10.27", "Grokipedia 上线", "AI 驱动百科全书，80 万+ 文章，定位 Wikipedia 替代品。争议较大", "deep"],
  ["2025.11.17", "Grok 4.1 / 4.1 Fast", "LMArena Elo 1483（#1），幻觉降低 65%，强调情商。4.1 Fast 支持 2M 上下文", "core"],
  ["2026.01.06", "xAI Series E", "$200 亿融资，估值 ~$2300 亿。NVIDIA/Cisco/Fidelity/卡塔尔投资局等参投", "core"],
  ["2026.01.28", "Grok Imagine API", "视频/图像/音频一体生成 API。Video Arena 排名 #1，定价 $4.20/min", "core"],
  ["2026.02.02", "SpaceX 收购 xAI", "全股票交易，合计估值 $1.25 万亿。史上最大科技合并案", "core"],
];

// Write back
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf-8');
console.log('✅ Chapter 1 sections 1.1-1.4 updated successfully');
console.log(`   OpenAI: ${openai.content[0].rows.length} entries`);
console.log(`   Google: ${google.content[0].rows.length} entries`);
console.log(`   Anthropic: ${anthropic.content[0].rows.length} entries`);
console.log(`   xAI: ${xai.content[0].rows.length} entries`);
