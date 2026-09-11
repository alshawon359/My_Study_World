#!/bin/bash
cd "$(dirname "$0")"
git add -A
git commit -m "feat: Full database integration for Research Papers and AI Roadmap

- Added 3 new Prisma models: StandaloneResearchPaper, AIRoadmapLevel, AIRoadmapTopic
- Created API routes for CRUD operations: /api/research-papers, /api/ai-roadmap, /api/ai-roadmap/topics
- Refactored Research page to use database APIs with real-time sync across browsers
- Refactored AI/ML Roadmap page to use database APIs with progress tracking
- Both pages now show 'Database Connected' status badge
- Data now persists in Aiven PostgreSQL and syncs across all browsers/devices"
git push origin main
