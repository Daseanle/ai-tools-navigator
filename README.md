# 🌟 AI Tools Navigator Pro

<p align="center">
  <a href="https://github.com/Daseanle/ai-tools-navigator/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License" />
  </a>
  <a href="https://github.com/Daseanle/ai-tools-navigator/pulls">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/built%20with-Next.js%2014-black.svg?style=flat-square" alt="Built with Next.js" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/styling-Tailwind%20CSS-38bdf8.svg?style=flat-square" alt="Tailwind CSS" />
  </a>
  <a href="https://github.com/Daseanle/ai-tools-navigator/actions/workflows/ai-maintenance.yml">
    <img src="https://img.shields.io/badge/automated%20maintenance-passing-success.svg?style=flat-square" alt="Automated Maintenance" />
  </a>
</p>

An open-source, highly curated AI tools discovery engine and productivity navigator tailored for developers and independent creators. Designed to be lightweight, modern, and completely self-sustaining.

---

## 🚀 Key Features

*   **🤖 Automated Tool Categorization**: Powered by LLMs, the system automatically parses tool metadata, descriptions, and domains to place submissions into exact developer-centric categories.
*   **🛡️ AI-Driven Code Security Audit**: Performs static security analysis on open-source submission endpoints to guarantee code safety and block malicious API endpoints.
*   **🔗 Full-Automatic Dead Link Detection**: A cron-triggered maintenance agent scanning URLs concurrently for `404`, `500` HTTP statuses, network timeouts, or suspicious domain hijackings/redirections.
*   **⚡ Modern Architecture**: Engineered with **Next.js**, **React 18+**, **Tailwind CSS**, and optimized for instant, zero-latency deployment on Vercel's global CDN network.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router & Edge Middleware support)
- **UI Library**: [React 18](https://react.dev/) + [Framer Motion](https://www.framer.com/motion/) for micro-interactions
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Fully customized dark/light mode palettes)
- **Database / Backend**: Supabase (PostgreSQL) + Redis for rate limiting
- **Automation / Agent**: Node.js automated workflows integration

---

## 📦 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Daseanle/ai-tools-navigator.git
cd ai-tools-navigator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Duplicate the environment template file:
```bash
cp .env.example .env.local
```
Add your credentials for Supabase, Redis, and OpenAI API Key.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the navigation dashboard.

---

## 🤖 NaviGuard-AI: Autonomous PR Review Agent

To enforce quality and security standards without manual oversight, we built **NaviGuard-AI**, an autonomous AI-driven pull-request audit agent. When a contributor registers a new tool in [tools.json](file:///Volumes/MOVESPEED/下载/AIcode/ai-tools-navigator-main/data/tools.json), the bot triggers automatically to analyze the PR.

### How It Works

1. **Change Tracking & Sandbox Probing**: It captures the git diff, isolates newly added tools, and opens a HTTP socket connection to scrape the live web pages.
2. **Metadata & Sentiment Scraper**: Downloads site titles and meta-descriptions to verify alignment with proposed directory values.
3. **OpenAI Security Scorecard Audit**: Utilizes GPT models to analyze scraped data, checking for security hazards (e.g. malvertising, fraud, cookie-jacking), validating classification accuracy, and polishing description wording.
4. **Automated Feedback Loop**: Reports results as a detailed PR review scorecard. If issues are found, it requests changes and halts the PR merge.

---

## 📡 Autopilot Curation: AI Intelligence Gathering

AI Tools Navigator Pro is not just a static catalog. Our native AI Agent operates a global intelligence loop to crawl, curate, and enrich the database without human intervention.

### The Autopilot Loop

1. **Global Source Crawling**: Every morning, the AI Cron scanner probes GitHub API for trending repositories tagged with `ai-agent`, `llm-tool`, and `gemini-plugin`.
2. **AI Lead Enrichment**: For every new project discovered, the AI automatically reads the repository's description, detects its official landing page, and drafts a polished description.
3. **Automatic Deduplication**: Discovered tools are dynamically compared against [tools.json](file:///Volumes/MOVESPEED/下载/AIcode/ai-tools-navigator-main/data/tools.json). Only unique, secure, and validated projects are appended.
4. **Automated Commit Stream**: The catalog is dynamically updated, committing changes directly back to the GitHub repository to keep the directory aligned with the state of the art in real-time.

---

### Locally Running the Agent

To preview how NaviGuard-AI sees your tool changes before submitting a PR, run:
```bash
export OPENAI_API_KEY="your-key-here"
node scripts/ai-pr-reviewer.js --local-test
```
This writes a local copy of the Markdown report to `pr-audit-report.md`.

---

## 🎙️ AI Voice QA & Qualification Lab (Playground)

We added an interactive customer qualification laboratory at `/playground` allowing real-time sales lead qualification audits:
*   **Active Voice Recording**: Captures audio stream dynamically using HTML5 MediaRecorder.
*   **Automated BANT Mining**: Translates speech via Whisper and extracts BANT (Budget, Authority, Need, Timeline) business metrics.
*   **Sentiment Flow Progress**: Charts emotional shifts across the speech timeline visually.
*   **Keyless Simulation**: Automatically runs a high-fidelity local simulation engine when API credentials are omitted, facilitating instant developer review.

---

## 🤝 Open Source Contribution Guide

We believe the AI space moves too fast for manual updates. We actively encourage community-driven submissions and codebase contributions to keep this directory dynamic!

### Step-by-Step Contribution Workflow

1. **Fork the Repository**: Click the **Fork** button at the top-right of this page.
2. **Clone Your Fork Locally**:
   ```bash
   git clone https://github.com/your-username/ai-tools-navigator.git
   cd ai-tools-navigator
   ```
3. **Create a Dedicated Branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Make Your Modifications**:
   - For UI tweaks, please ensure dark mode compliance.
   - For adding new tools, insert your tool definition object inside [tools.json](file:///Volumes/MOVESPEED/下载/AIcode/ai-tools-navigator-main/data/tools.json).
5. **Verify Links Locally**:
   Ensure no broken URLs exist in your changes by running:
   ```bash
   node scripts/check-links.js
   ```
6. **Commit with Conventional Messages**:
   ```bash
   git commit -m "feat: add new AI developer productivity tool"
   ```
7. **Push to Your Fork**:
   ```bash
   git push origin feat/your-feature-name
   ```
8. **Submit a Pull Request (PR)**: Submit your PR against our `main` branch. Provide a brief explanation of the tool or improvement.

### Contribution Rules

*   **URL Quality**: All tools must point to official domains. Links with adware, cookie-hijack redirections, or immediate paywalls will be flagged.
*   **PR Check Automation**: Every PR triggers our Github Action runner executing the link sanity script. Failed status checks will block integration until fixed.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](file:///Volumes/MOVESPEED/下载/AIcode/ai-tools-navigator-main/LICENSE) file for details.

<!-- NaviGuard-AI Security Audited - 2026-06-01 -->
