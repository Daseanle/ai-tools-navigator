# AI Tools Navigator Pro

An open-source, highly curated AI tools discovery engine and productivity navigator tailored for developers and independent creators.

## 🚀 Features

- **Automated Tool Categorization**: Smartly categorizes new AI tools using LLMs to keep the directory organized without manual effort.
- **AI-Driven Code Security Audit**: Automatically audits open-source tools for potential security vulnerabilities and risky code patterns.
- **Fully Automated Dead Link Detection**: A self-maintaining system that periodically checks all tool URLs for 404s, 500s, or suspicious redirects to ensure the directory is always up-to-date.
- **Modern Tech Stack**: Built with Next.js App Router, React, Tailwind CSS, and optimized for Vercel deployment.
- **Developer-Focused**: Tailored for developers and independent creators to discover APIs, SDKs, and productivity tools.

## 🛠 Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Database**: Supabase / PostgreSQL

## 📦 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-tools-navigator.git
cd ai-tools-navigator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and add your specific configurations:

```bash
cp .env.example .env.local
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Open Source Contribution Guide

We actively welcome open-source contributions! Whether it's submitting a new AI tool, fixing bugs, or adding new features, your help makes this project better.

### How to Contribute

1. **Fork the repository** to your own GitHub account.
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure everything runs locally. If you are adding a new AI tool, please ensure the URL is valid.
4. **Commit your changes** with descriptive commit messages:
   ```bash
   git commit -m "feat: add new AI tool XYZ"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request (PR)** against our `main` branch. 
   - Please provide a clear description of the changes.
   - Our automated GitHub Actions will run checks (including dead link detection) on your PR.

### Contribution Rules
- All new tools must be relevant to developers or independent creators.
- Do not submit tools with malicious redirects or paywalls masquerading as free tools.
- Please follow the existing code style and structure.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
