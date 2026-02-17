const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const { loadClintonJson } = require('./load-clinton-json');
const emailsRouter = require('./routes/emails');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const projectRoot = path.resolve(__dirname, '..');
const CLINTON_JSON_PATH = process.env.CLINTON_JSON_PATH || process.env.DATA_PATH || path.join(projectRoot, 'Clinton Emails.json');
const INDEX_JSON_PATH = path.join(__dirname, 'data', 'emails-index.json');

if (isProduction) {
  app.set('trust proxy', 1);
  app.use(compression());
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(express.json());

let emailStore = null;

function loadData() {
  try {
    if (fs.existsSync(CLINTON_JSON_PATH)) {
      const { emails, people } = loadClintonJson(CLINTON_JSON_PATH);
      emailStore = { emails, people };
      console.log(`Loaded ${emails.length} emails, ${people.length} people from Clinton Emails.json`);
    } else if (fs.existsSync(INDEX_JSON_PATH)) {
      const raw = fs.readFileSync(INDEX_JSON_PATH, 'utf8');
      const { emails, people } = JSON.parse(raw);
      emailStore = { emails, people };
      console.log(`Loaded ${emails.length} emails, ${people.length} people from index`);
    } else {
      console.error('No data file found. Place "Clinton Emails.json" in the project root or set CLINTON_JSON_PATH or DATA_PATH.');
      emailStore = { emails: [], people: [] };
    }
  } catch (err) {
    console.error('Failed to load data:', err.message);
    emailStore = { emails: [], people: [] };
  }
}

loadData();
app.locals.emailStore = emailStore;

app.use('/api', emailsRouter);

const distPath = path.join(__dirname, '..', 'client', 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

app.use(express.static(distPath, { index: false }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, emails: (app.locals.emailStore && app.locals.emailStore.emails.length) || 0 });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (!fs.existsSync(indexHtmlPath)) {
    res.status(503).contentType('text/html').send(
      '<!DOCTYPE html><html><head><title>Not built</title></head><body><h1>Client not built</h1><p>Run <code>npm run build</code> (or <code>npm run build:client</code>) then restart the server.</p></body></html>'
    );
    return;
  }
  res.sendFile(indexHtmlPath, (err) => {
    if (err) {
      res.status(500).contentType('text/plain').send('Error serving app');
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`hmail server on port ${PORT}`);
});
