const express = require('express');
const router = express.Router();

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function getStore(req) {
  return req.app.locals.emailStore;
}

function normalizeForMatch(str) {
  return (str || '').toLowerCase().trim();
}

function matchesPerson(email, person) {
  if (!person) return true;
  const p = normalizeForMatch(person);
  return (
    normalizeForMatch(email.from).includes(p) ||
    normalizeForMatch(email.to).includes(p)
  );
}

function matchesSearch(email, q) {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    (email.subject && email.subject.toLowerCase().includes(lower)) ||
    (email.from && email.from.toLowerCase().includes(lower)) ||
    (email.to && email.to.toLowerCase().includes(lower)) ||
    (email.body && email.body.toLowerCase().includes(lower)) ||
    (email.snippet && email.snippet.toLowerCase().includes(lower))
  );
}

function toListEntry(email) {
  return {
    id: email.id,
    from: email.from,
    to: email.to,
    sent: email.sent,
    subject: email.subject,
    snippet: email.snippet,
  };
}

router.get('/emails', (req, res) => {
  const store = getStore(req);
  if (!store) return res.status(503).json({ error: 'Data not loaded' });

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
  const folder = (req.query.folder || 'inbox').toLowerCase();
  const person = (req.query.person || '').trim();
  const sort = (req.query.sort || 'date').toLowerCase();

  let list = folder === 'sent' ? store.emails.filter(e => e.isSent) : store.emails;

  if (person) {
    list = list.filter(e => matchesPerson(e, person));
  }

  if (sort === 'subject') {
    list = [...list].sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
  } else if (sort === 'date_asc') {
    list = [...list].sort((a, b) => (a.sent || '').localeCompare(b.sent || ''));
  } else {
    list = [...list].sort((a, b) => (b.sent || '').localeCompare(a.sent || ''));
  }

  const total = list.length;
  const start = (page - 1) * limit;
  const emails = list.slice(start, start + limit).map(toListEntry);

  res.json({ total, page, limit, emails });
});

router.get('/emails/:id', (req, res) => {
  const store = getStore(req);
  if (!store) return res.status(503).json({ error: 'Data not loaded' });

  const email = store.emails.find(e => e.id === req.params.id);
  if (!email) return res.status(404).json({ error: 'Not found' });

  res.json(email);
});

router.get('/search', (req, res) => {
  const store = getStore(req);
  if (!store) return res.status(503).json({ error: 'Data not loaded' });

  const q = (req.query.q || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));

  let list = q ? store.emails.filter(e => matchesSearch(e, q)) : store.emails;
  list = [...list].sort((a, b) => (b.sent || '').localeCompare(a.sent || ''));

  const total = list.length;
  const start = (page - 1) * limit;
  const emails = list.slice(start, start + limit).map(toListEntry);

  res.json({ total, page, limit, emails });
});

router.get('/people', (req, res) => {
  const store = getStore(req);
  if (!store) return res.status(503).json({ error: 'Data not loaded' });

  let people = store.people || [];
  const filter = (req.query.filter || '').trim().toLowerCase();
  if (filter) {
    people = people.filter(p =>
      (p.display && p.display.toLowerCase().includes(filter)) ||
      (p.name && p.name.toLowerCase().includes(filter))
    );
  }
  res.json(people);
});

function parseDateKey(sent) {
  if (!sent) return null;
  const d = new Date(sent);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

router.get('/activity', (req, res) => {
  const store = getStore(req);
  if (!store) return res.status(503).json({ error: 'Data not loaded' });

  const year = parseInt(req.query.year, 10);
  if (!year || year < 1990 || year > 2030) {
    return res.status(400).json({ error: 'Invalid year' });
  }

  const counts = {};
  for (const e of store.emails) {
    const key = parseDateKey(e.sent);
    if (key && key.startsWith(String(year))) {
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  res.json({ year, counts, total });
});

router.get('/emails-by-date', (req, res) => {
  const store = getStore(req);
  if (!store) return res.status(503).json({ error: 'Data not loaded' });

  const date = (req.query.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date (use YYYY-MM-DD)' });
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 50));

  const list = store.emails.filter((e) => parseDateKey(e.sent) === date);
  list.sort((a, b) => (b.sent || '').localeCompare(a.sent || ''));
  const total = list.length;
  const start = (page - 1) * limit;
  const emails = list.slice(start, start + limit).map(toListEntry);
  res.json({ total, page, limit, emails, date });
});

module.exports = router;
