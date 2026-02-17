# Hmail

A Gmail-style browser for Hillary Clinton’s State Department emails. Data is from FBI seizure and State Department/FOIA releases.

**Made by [The Dula Dispatch](https://mrdula.substack.com/).**

## Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Data:** JSON (from `Clinton Emails.json` or `server/data/emails-index.json`)

## Run locally

**Requirements:** Node.js 18+

```bash
npm install
```

**Development** (client hot-reload + server):

```bash
npm run dev
```

**Production-style** (build then serve):

```bash
npm run build
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

## Data

The server needs email data at runtime:

- Put `Clinton Emails.json` in the project root, or
- Set `CLINTON_JSON_PATH` or `DATA_PATH` to the path of your JSON file, or
- Use a pre-built `server/data/emails-index.json` (see `scripts/build-email-index.js` if you have the source XML).

Without a data file, the app starts but the list is empty.

## Deploy

See **[DEPLOY.md](./DEPLOY.md)** for Railway (and general production) setup, env vars, and health check.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Run client (Vite) + server with watch |
| `npm run build` | Build index (if applicable) + client |
| `npm run build:client` | Build client only |
| `npm start` | Run production server |

## License

See repo and [What is this?](https://mrdula.substack.com/) in the app for context and legal disclaimer.
