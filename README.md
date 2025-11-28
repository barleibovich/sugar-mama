# SugarMama Web (React + Vite)

Prototype web app for gestational diabetes tracking: log glucose readings by category (fasting, after meals), see if values are in range, and export a PDF report.

## Quick Start
1. Install deps: `npm install`
2. Run dev server: `npm run dev`
3. Build for prod: `npm run build`
4. Type check: `npm run typecheck`

## Features
- Daily categories in Hebrew: צום, אחרי ארוחת בוקר, אחרי ארוחת צהריים, אחרי ארוחת ערב.
- Add measurements with timestamp; status badge shows in‑range / above / below based on ranges.
- Week navigation (Sunday-first), add-by-cell, and PDF export with Hebrew font.
- Local video guide embedded; link to external medical info; service worker + manifest for PWA/offline caching.
- Ranges are defined in `src/ranges.ts` and can be adjusted.

## Key Files
- `src/App.tsx`: Layout and view toggles.
- `src/context/MeasurementProvider.tsx`: State/store with localStorage.
- `src/components/Home.tsx`: Intro, instructions, videos, external link.
- `src/components/Measurements.tsx`: Table view, week navigation, add/delete, PDF export.
- `src/components/AddMeasurementModal.tsx`: Add measurement form.
- `src/pdf/exportPdf.ts`: Hebrew PDF generation (jsPDF).
- `src/ranges.ts` / `src/constants.ts`: Categories and default ranges.
- `src/styles.css`: Base styling.

## Notes
- All UI text is in Hebrew; logic and code comments remain in English.
- OCR is not implemented; current flow is manual entry only.
- PWA: manifest + service worker are present for offline caching of core assets and the local video.
