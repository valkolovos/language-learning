# Quick Start Guide for New Contributors

This guide will get you running the Listen-First language learning platform locally in a few minutes.

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for backend tests)
- Git

## 1. Clone and Setup

```bash
git clone <repository-url>
cd language-learning
```

## 2. Frontend Setup (React + TypeScript)

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

## 3. Backend Setup (Python + FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`

## 4. Add Audio Assets

Place your audio files in `frontend/public/audio/` with these exact names:
- `main-line-audio.mp3` - Main greeting phrase (~2.5s)
- `phrase-1-audio.mp3` - First supporting phrase (~2.5s)  
- `phrase-2-audio.mp3` - Second supporting phrase (~2.5s)
- `phrase-3-audio.mp3` - Third supporting phrase (~2.5s)

**Audio Requirements:**
- Format: MP3
- Duration: ≤2.5 seconds each
- Volume: Normalized (similar loudness)
- Language: Any (configure in `frontend/src/constants/audio.ts`)

## 5. Test the Lesson

1. Open `http://localhost:3000` in your browser
2. You should see the "Listen First" interface
3. Click Play to hear the main line
4. Listen twice to unlock the text reveal
5. Click "Show Text" to see the full lesson
6. Practice individual phrases

## 6. Run Quality Checks

```bash
# Frontend
cd frontend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run build         # Build check

# Backend  
cd backend
pytest               # Python tests
```

## 7. Key Files to Know

- **Lesson Data**: `frontend/src/data/sampleLessons.ts`
- **Audio Logic**: `frontend/src/services/audioPlaybackService.ts`
- **UI Components**: `frontend/src/components/`
- **Microcopy**: `frontend/src/constants/microcopy.ts` (edit strings here)
- **Tests**: `frontend/features/` (Cucumber BDD tests)

## 8. Making Changes

- **Text/Strings**: Edit `frontend/src/constants/microcopy.ts`
- **Audio**: Replace files in `frontend/public/audio/`
- **Lesson Content**: Modify `frontend/src/data/sampleLessons.ts`
- **Styling**: Edit `frontend/src/App.css`

## 9. Troubleshooting

- **Audio not playing**: Check browser console, ensure files exist in `/public/audio/`
- **Tests failing**: Run `npm run test` to see specific failures
- **Build errors**: Check TypeScript errors with `npm run build`

## 10. Next Steps

- Run the QA checklist in `project_docs/accessibility_qa_checklist.md`
- Check the commit breakdown in `project_docs/commit_breakdown_listen_first_micro_lesson.md`
- Review the MVP goals in `project_docs/project_summary_mvp_goals_roadmap.md`

## Need Help?

- Check the main `README.md` for project overview
- Review `DEVELOPMENT.md` for development guidelines
- Run `just` commands (see root `justfile`) for common tasks

---

**You're all set!** The platform should be running locally with your audio assets. The listen-first gate will unlock after two complete plays of the main line, revealing the full lesson content.
