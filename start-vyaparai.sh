#!/usr/bin/env bash
echo "========================================================"
echo "  Starting VyaparAI — Agentic Back Office for MSMEs"
echo "========================================================"
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi

echo "Launching Backend and Frontend concurrently..."
echo "  - Backend API:       http://localhost:5000"
echo "  - Frontend & Sim:    http://localhost:3000"
echo ""

npm run dev
