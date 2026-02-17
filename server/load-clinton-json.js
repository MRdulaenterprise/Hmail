const fs = require('fs');
const path = require('path');
const { buildPeopleIndex } = require('./parser');

const DOC_NO_RE = /Doc No\.\s+(C\d+)/i;

function extractIdFromHeader(content) {
  const m = (content || '').match(DOC_NO_RE);
  return m ? m[1] : null;
}

function parseMetadata(text) {
  const from = (text.match(/From:\s*([^\n]+)/i) || [])[1];
  const to = (text.match(/To:\s*([^\n]+)/i) || [])[1];
  const sent = (text.match(/Sent:\s*([^\n]+)/i) || [])[1];
  const subject = (text.match(/Subject:\s*([^\n]+)/i) || [])[1];
  return {
    from: from ? from.trim() : '',
    to: to ? to.trim() : '',
    sent: sent ? sent.trim() : '',
    subject: subject ? subject.trim() : '',
  };
}

function parseTableMetadata(content) {
  const lines = (content || '').split('\n').filter(Boolean);
  const meta = { from: '', to: '', sent: '', subject: '' };
  for (const line of lines) {
    const fromMatch = line.match(/\|\s*From:\s*\|\s*([^|]+)/i);
    if (fromMatch) meta.from = fromMatch[1].trim();
    const toMatch = line.match(/\|\s*To:\s*\|\s*([^|]+)/i);
    if (toMatch) meta.to = toMatch[1].trim();
    const sentMatch = line.match(/\|\s*Sent:\s*\|\s*([^|]+)/i);
    if (sentMatch) meta.sent = sentMatch[1].trim();
    const subjMatch = line.match(/\|\s*Subject:\s*\|\s*([^|]+)/i);
    if (subjMatch) meta.subject = subjMatch[1].trim();
  }
  return meta;
}

function isLikelySent(from) {
  const f = (from || '').toLowerCase();
  return f.includes('h@') || f.includes('clintonemail') || f.includes('hdr22');
}

function loadClintonJson(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(resolved, 'utf8');
  const data = JSON.parse(raw);
  const chunks = (data.result && data.result.chunks) || [];
  const emails = [];
  const seenIds = new Set();

  for (const chunk of chunks) {
    const blocks = chunk.blocks;
    if (!blocks || typeof blocks !== 'object') continue;
    const indices = Object.keys(blocks)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);

    let current = null;
    let bodyParts = [];

    for (const i of indices) {
      const block = blocks[i];
      const type = (block && block.type) || '';
      const content = (block && block.content) || '';

      if (type === 'Header' && content) {
        const id = extractIdFromHeader(content);
        if (id && !seenIds.has(id)) {
          if (current) {
            current.body = bodyParts.join('\n\n').trim();
            current.snippet = (current.body || '').slice(0, 120).replace(/\s+/g, ' ').trim();
            if (current.snippet.length >= 120) current.snippet += '…';
            emails.push(current);
          }
          seenIds.add(id);
          current = { id, docNo: id, releaseType: 'FULL', from: '', to: '', sent: '', subject: '', body: '', snippet: '', isSent: false };
          bodyParts = [];
        }
        continue;
      }

      if (type === 'Footer' && current) {
        current.body = bodyParts.join('\n\n').trim();
        current.snippet = (current.body || '').slice(0, 120).replace(/\s+/g, ' ').trim();
        if (current.snippet.length >= 120) current.snippet += '…';
        emails.push(current);
        current = null;
        bodyParts = [];
        continue;
      }

      if (!current) continue;

      if (type === 'Key Value' && content) {
        if (/From:\s*.+(\n|Sent:)/i.test(content) || /^\s*From:\s*/im.test(content)) {
          const meta = parseMetadata(content);
          if (meta.from || meta.to || meta.sent || meta.subject) {
            if (meta.from) current.from = meta.from;
            if (meta.to) current.to = meta.to;
            if (meta.sent) current.sent = meta.sent;
            if (meta.subject) current.subject = meta.subject;
            current.isSent = isLikelySent(current.from);
          } else {
            bodyParts.push(content);
          }
        } else {
          bodyParts.push(content);
        }
        continue;
      }

      if (type === 'Table' && content && /From:\s*\|/i.test(content)) {
        const meta = parseTableMetadata(content);
        if (meta.from) current.from = meta.from;
        if (meta.to) current.to = meta.to;
        if (meta.sent) current.sent = meta.sent;
        if (meta.subject) current.subject = meta.subject;
        current.isSent = isLikelySent(current.from);
        continue;
      }

      if ((type === 'Text' || type === 'Key Value') && content) {
        bodyParts.push(content);
      }
    }

    if (current) {
      current.body = bodyParts.join('\n\n').trim();
      current.snippet = (current.body || '').slice(0, 120).replace(/\s+/g, ' ').trim();
      if (current.snippet.length >= 120) current.snippet += '…';
      emails.push(current);
    }
  }

  const people = buildPeopleIndex(emails);
  return { emails, people };
}

module.exports = { loadClintonJson };
