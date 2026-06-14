# SahayAI X

SahayAI X is a full-stack emergency intelligence application with:

- A modern React + Vite frontend in `src/`
- A Python FastAPI backend in `sahayai_x_ai/`
- A local development stack that can run frontend and backend together

## Project structure

- `src/` — frontend application code
- `sahayai_x_ai/` — backend API, models, and scripts
- `package.json` — frontend and workspace scripts
- `requirements.txt` — Python backend dependencies
- `README.md` — project setup and run instructions

## Requirements

- Node.js and npm
- Python 3.11
- Git (for version control)

## Setup

### 1. Install frontend dependencies

```powershell
npm install
```

### 2. Create and activate Python virtual environment

```powershell
python -m venv .venv
.venv\Scripts\activate
```

### 3. Install backend dependencies

```powershell
pip install -r requirements.txt
```

## Running the project

### Run frontend only

```powershell
npm run dev
```

If port `8080` is busy, Vite may fall back to `8081` or another available port.

### Run backend only

```powershell
npm run backend
```

This starts the FastAPI backend on:

- `http://0.0.0.0:8000`

### Run full stack together

```powershell
npm run fullstack
```

This command launches both backend and frontend. If `npm` is not in PATH, use the frontend command manually.

## Available npm scripts

- `npm run dev` — start frontend dev server
- `npm run backend` — start Python FastAPI backend
- `npm run fullstack` — launch frontend + backend together
- `npm run build` — build frontend for production
- `npm run preview` — preview frontend build
- `npm run demo:backend` — run backend demo/test script
- `npm run lint` — run ESLint
- `npm run format` — format code with Prettier

## Port details

- Frontend default: `http://localhost:8080`
- Backend default: `http://localhost:8000`

If the frontend falls back to another port, use the one shown by Vite in the terminal.

## Troubleshooting

### `npm` not found

If `npm` is not available, install Node.js and make sure it is added to PATH.

### Backend port already in use

If port `8000` is already taken, stop the existing backend process or change the backend startup port in `sahayai_x_ai/scripts/run_backend.py`.

### Manual startup workaround

If `npm run fullstack` fails, run both servers manually:

```powershell
.venv\Scripts\activate
npm run backend
npm run dev
```

## Git commit command

Once the README is saved, use these commands to commit:

```powershell
git add README.md
git commit -m "docs: add full setup and run instructions for SahayAI X"
git push origin main
```

If you want to include all current changes instead of only README:

```powershell
git add .
git commit -m "docs: update README with full setup and run instructions"
git push origin main
```
