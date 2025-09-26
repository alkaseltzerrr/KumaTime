# KumaTime 🐻✨

Welcome to KumaTime — your adorable study buddy that helps you focus with cozy Pomodoro sessions, tiny progress rewards, and a bear who cheers you on. This README will help you get the project running locally and give a quick tour of what's inside. 💖

---

## Table of Contents
- About
- Features
- Quick start (Windows cmd)
- Environment variables
- Project layout
- Troubleshooting tips
- Contributing
- License

---

## About
KumaTime pairs a sweet virtual buddy with a Pomodoro timer to make focusing feel friendlier. It's a small full-stack app (Node/Express backend + Vite + React frontend) built with a pastel aesthetic and gentle micro-interactions.

The project is a work-in-progress and lovingly crafted — expect cute animations, snackable features, and room to grow. 🌸

## Features
- Cute virtual buddy with mood and levels 🐻
- Pomodoro timer with configurable work/break cycles ⏱️
- Session history stored locally (and optionally synced to a backend) 📚
- Lightweight backend for session persistence and user profile (Postgres) 🐘
- Tailwind CSS + Vite-powered frontend for fast development ⚡

## Quick start (Windows cmd)
These commands assume you're on Windows and using the default `cmd.exe` shell.

1) Clone the repo (if you haven't already):

	git clone <your-repo-url>
	cd KumaTime

2) Backend

	cd backend
	npm install
	REM if you have a dev script (nodemon), use npm run dev
	npm start

	The backend expects a Postgres database. Provide a `DATABASE_URL` in `backend/.env` (example below).

3) Frontend

	cd ..\frontend
	npm install
	npm run dev

	Vite will print a local URL (commonly http://localhost:5173). Open it in your browser and enjoy the cute bear.

## Environment variables
- `backend/.env` — set your Postgres connection string, for example:

  DATABASE_URL=postgresql://postgres:password@localhost:5432/kumatime

- `frontend/.env` — public client settings (do not put server secrets here). For example:

  VITE_API_URL=http://localhost:3000/api

Keep secrets out of the frontend `.env` — only public URLs or feature flags belong there.

## Project layout (short)
- `backend/` — Node/Express API, Postgres integration, controllers and routes
- `frontend/` — Vite + React + Tailwind UI, components like `PomodoroTimer` and `VirtualBuddy`

## Tweaks & customization
- Want the bear to be chubbier or more expressive? Check `frontend/src/components/VirtualBuddy.jsx` and update the emoji/animations.
- Timer appearance and spacing live in `frontend/src/components/PomodoroTimer.jsx`. Tailwind utility classes make it easy to adjust sizes, shadows, and spacing.

## Troubleshooting
- Postgres auth error: make sure `backend/.env` has correct credentials and your Postgres server is running.
- Tailwind/PostCSS errors: ensure you installed frontend dependencies (`npm install`) and that `frontend/package.json` uses a Tailwind version compatible with the `postcss.config.js` present in the repo.
- If you see permission or lockfile issues, try deleting `node_modules` and reinstalling.

## Contributing
All contributions are welcome — fixes, styles, small features, or ideas. If you'd like to contribute:

1. Create an issue describing the change you'd like to make.
2. Make a small, focused branch with a clear commit message.
3. Open a pull request and add a screenshot or short description of the change.

Be kind — keep changes small and delightful. 🧸

---

If you'd like, I can also:
- add startup scripts to `package.json` (dev + start) if they are missing,
- add a prettier README screenshot or GIF,
- or run the frontend locally and capture a screenshot to include here.

Happy focusing! ✨🐻

