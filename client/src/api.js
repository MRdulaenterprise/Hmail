const BASE = '';

export async function fetchEmails({ page = 1, limit = 50, folder = 'inbox', person = '', sort = 'date' } = {}) {
  const params = new URLSearchParams({ page, limit, folder, sort });
  if (person) params.set('person', person);
  const res = await fetch(`${BASE}/api/emails?${params}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchEmail(id) {
  const res = await fetch(`${BASE}/api/emails/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function searchEmails(q, { page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (q) params.set('q', q);
  const res = await fetch(`${BASE}/api/search?${params}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchPeople(filter = '') {
  const params = filter ? `?filter=${encodeURIComponent(filter)}` : '';
  const res = await fetch(`${BASE}/api/people${params}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchActivity(year) {
  const res = await fetch(`${BASE}/api/activity?year=${year}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

export async function fetchEmailsByDate(date, { page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ date, page, limit });
  const res = await fetch(`${BASE}/api/emails-by-date?${params}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}
