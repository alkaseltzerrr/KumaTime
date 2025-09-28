
# KumaTime 🐻✨

A small, friendly Pomodoro app with a cute virtual buddy to help you focus. (๑˃ᴗ˂)ﻭ

## Features ✨ (*＾-＾*)
- Virtual buddy (mood & level) 🐻
- Configurable Pomodoro timer (work/short/long) ⏱️
- Circular progress ring + small animations ✨
- Local session history; optional server sync 📚

## Tech ⚙️ (❁´◡`❁)
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, Postgres (pg)

## Quick start (Windows cmd) ▶︎ (ﾉ´ヮ`)ﾉ*: ･ﾟ
From repo root in Command Prompt:

```cmd
git clone <your-repo-url>
cd KumaTime

cd backend
npm install
npm run dev   REM starts nodemon

REM in another terminal:
cd frontend
npm install
npm run dev
```

Open the Vite URL shown (usually http://localhost:5173).

## Folder structure 📁 (・ω・)ノ
backend/
- .env (local)
- package.json
- src/
	- server.js
	- config/
	- controllers/
	- middleware/
	- models/
	- routes/

frontend/
- .env
- package.json
- public/
- src/
	- components/PomodoroTimer.jsx
	- components/VirtualBuddy.jsx
	- pages/
	- contexts/

## Example env files 🔑 (๑•̀ㅂ•́)و✧
Create `backend/.env` (local only):

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kumatime
PORT=3000
```

Create `frontend/.env` (public values only):

```env
VITE_API_URL=http://localhost:3000
```

## Troubleshooting 🛠️ (；・∀・)
- **Browser compatibility**: This app is optimized for Chrome/Chromium-based browsers. Firefox may have issues with animations and styling.
- Backend DB errors: check `backend/.env` and Postgres is running.
- Frontend build errors: run `npm install` in `frontend/` and check Tailwind/PostCSS.
- If things break, remove `node_modules` and reinstall.
---

Thank you for visiting KumaTime — may your focus be kind, and your breaks be sweet. 🍯🐻 (＾▽＾)


