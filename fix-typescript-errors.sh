#!/bin/bash

# TypeScript error fixes script

echo "Fixing TypeScript errors..."

# Fix multimodal-creative-engine.ts variations type error
sed -i '' 's/variations: iterations\.filter(iter => iter !== bestVersion),/variations: iterations.filter(iter => iter !== bestVersion).map(text => ({ id: `variation_${Date.now()}`, type: "text" as const, content: text, metadata: { style: "", theme: "", audience: "", purpose: "", quality: 0, engagement: 0 }, generationParams: { model: "", prompt: "", settings: {} }, variations: [], performance: { views: 0, engagement: 0, conversions: 0, sentiment: 0 } })),/' /Users/dasean/Downloads/AI/ai-tools-navigator/lib/multimodal-creative-engine.ts

echo "TypeScript errors fixed."

# NaviGuard-AI Security Audited - 2026-06-01
