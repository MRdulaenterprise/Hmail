# Deploying HMail

## Railway

1. **Create a new project** at [railway.app](https://railway.app) and connect your GitHub repo (`MRdulaenterprise/Hmail` or your fork).

2. **Build & start**
   - Railway uses **Nixpacks** with this repo’s config:
     - **Build:** `npm run build` (builds email index if present, then the client with Vite).
     - **Start:** `npm start` (runs `node server/index.js`).
   - `PORT` is set by Railway; the app uses `process.env.PORT || 3000`.

3. **Data file (required)**
   The server needs email data at runtime. Use one of these:

   - **Option A – Commit data in the repo**  
     Keep `Clinton Emails.json` in the project root (or commit `server/data/emails-index.json`). The build will run and the app will load from the repo.

   - **Option B – Env + external file**  
     Set in Railway **Variables**:
     - `CLINTON_JSON_PATH` or `DATA_PATH` = path to a JSON file on the deployed filesystem, **or**
     - If you use a volume or inject a file at deploy time, point one of these env vars at that path.

   If no data file is found, the app starts but the email list will be empty (API returns 503 for data-dependent routes until data is available).

4. **Environment variables (optional)**

   | Variable           | Description |
   |--------------------|-------------|
   | `PORT`             | Set by Railway; no need to set. |
   | `NODE_ENV`         | Set to `production` in production; enables compression, helmet, trust proxy. |
   | `CLINTON_JSON_PATH` or `DATA_PATH` | Path to `Clinton Emails.json` (or equivalent) if not in project root. |

5. **Health check**  
   Use `GET /api/health` for readiness. It returns `{ "ok": true, "emails": <number> }`.

---

## Local production-style run

```bash
npm install
npm run build
NODE_ENV=production npm start
```

Then open `http://localhost:3000` (or the port you set).

---

## Safe SPA fallback

- Non-API `GET` requests are served `client/dist/index.html` when it exists (client must be built).
- If `client/dist/index.html` is missing (e.g. build failed or wasn’t run), the server responds with **503** and a short HTML message asking you to run `npm run build` (or `npm run build:client`).
- API routes (`/api/*`) are unchanged and do not serve the SPA.
