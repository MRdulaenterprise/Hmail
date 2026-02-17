const path = require('path');
const fs = require('fs');
const express = require('express');
const { loadClintonJson } = require('./load-clinton-json');
const emailsRouter = require('./routes/emails');

const app = express();
const projectRoot = path.resolve(__dirname, '..');
const CLINTON_JSON_PATH = process.env.CLINTON_JSON_PATH || process.env.DATA_PATH || path.join(projectRoot, 'Clinton Emails.json');
const INDEX_JSON_PATH = path.join(__dirname, 'data', 'emails-index.json');

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
app.use(express.static(distPath));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, emails: (app.locals.emailStore && app.locals.emailStore.emails.length) || 0 });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`hmail server on port ${PORT}`);
});
