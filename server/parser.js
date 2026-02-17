const fs = require('fs');
const path = require('path');

// Allow trailing ) or other OCR noise
const RELEASE_PATTERN = /^\s*RELEASE IN (FULL|PART [A-Z0-9]+)\s*\)?\s*$/i;
const RELEASE_START_PATTERN = /^\s*RELEASE IN (FULL|PART [A-Z0-9]+)/i;
// Doc No. line: allow OCR typos (UNCLASSIFIE D, U. S., etc.)
const DOC_NO_PATTERN = /Doc No\. (C05\d+)\s+Date:/i;
const UNCLASSIFIED_PATTERN = /UNCLASSIFIE[D\s]*D?\s*[U\.]?\s*S?\.?\s*Department[\s\S]*?Doc No\. (C05\d+)\s+Date:/i;
function matchDocNo(line) {
  const m = line.match(DOC_NO_PATTERN);
  if (m) return m[1];
  const m2 = line.match(UNCLASSIFIED_PATTERN);
  if (m2) return m2[1];
  if (/Department.*State.*Case No/.test(line) && DOC_NO_PATTERN.test(line)) {
    const m3 = line.match(DOC_NO_PATTERN);
    if (m3) return m3[1];
  }
  return null;
}

/** Normalize HTML entity and trim */
function text(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/** Extract all <p> text contents from bodymatter in order */
function extractParagraphs(xmlString) {
  const paragraphs = [];
  const bodymatterStart = xmlString.indexOf('<bodymatter');
  const bodymatterEnd = xmlString.indexOf('</bodymatter>');
  if (bodymatterStart === -1 || bodymatterEnd === -1) return paragraphs;
  const body = xmlString.slice(bodymatterStart, bodymatterEnd + '</bodymatter>'.length);
  const pRegex = /<p\s[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRegex.exec(body)) !== null) {
    const inner = m[1].replace(/<[^>]+>/g, ' ').trim();
    paragraphs.push(text(inner));
  }
  return paragraphs;
}

/** Heuristic: is this line a "From:" / "Sent:" / "To:" / "Subject:" / "Cc:" label only? */
function isHeaderLabel(line) {
  const t = line.trim();
  return /^(From|Sent|To|Subject|Cc)\s*:?\s*$/i.test(t) || t === 'Subject';
}

/** Parse combined line like "Name <email> Monday, December 7, 2009 1:09 PM H" or "RE: Mini schedule". Returns true if line was consumed as header. */
function parseHeaderLine(line, ctx) {
  const t = line.trim();
  if (!t) return false;
  const looksLikeFromDate = t.includes('@') && /[A-Za-z]+\s*,?\s*[A-Za-z]+\s+\d{1,2},?\s*\d{4}/.test(t);
  if (looksLikeFromDate) {
    const emailMatch = t.match(/<([^>]+)>/);
    const fromPart = emailMatch ? t.slice(0, emailMatch.index).trim() : t;
    const dateMatch = t.match(/([A-Za-z]+\s*,?\s*[A-Za-z]+\s+\d{1,2},?\s*\d{4}\s+[\d:\s]+(?:\s*[AP]M)?(?:\s*H)?)/i) || t.match(/([A-Za-z]+\s+\d{1,2},?\s*\d{4}\s+[\d:]+(?:\s*[AP]M)?)/i);
    if (!ctx.from && fromPart) ctx.from = fromPart + (emailMatch ? ' <' + emailMatch[1] + '>' : '');
    if (dateMatch && !ctx.sent) ctx.sent = dateMatch[1].trim();
    return true;
  }
  if (!ctx.subjectSet && t.length > 0 && t.length < 250 && !/^(From|To|Sent|Original|—|-)/i.test(t) && !t.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/) && !t.match(/\d{1,2}:\d{2}\s*[AP]M/i)) {
    ctx.subject = t;
    ctx.subjectSet = true;
    return true;
  }
  return false;
}

/** Parse multi-line header block (From:/Sent:/To:/Subject: on separate lines) */
function parseSeparateHeaders(lines, startIdx, ctx) {
  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i];
    if (RELEASE_PATTERN.test(line) || UNCLASSIFIED_PATTERN.test(line)) break;
    if (isHeaderLabel(line)) {
      i++;
      continue;
    }
    const t = line.trim();
    if (t.match(/^From:\s*/i)) { ctx.from = t.replace(/^From:\s*/i, '').trim(); i++; continue; }
    if (t.match(/^Sent:\s*/i)) { ctx.sent = t.replace(/^Sent:\s*/i, '').trim(); i++; continue; }
    if (t.match(/^To:\s*/i)) { ctx.to = t.replace(/^To:\s*/i, '').trim(); i++; continue; }
    if (t.match(/^Subject\s*:?\s*/i)) { ctx.subject = t.replace(/^Subject\s*:?\s*/i, '').trim(); i++; continue; }
    if (t && t.length < 300 && !ctx.subject && !/Original Message|UNCLASSIFIED|RELEASE/i.test(t)) {
      parseHeaderLine(line, ctx);
    }
    i++;
    if (ctx.from && ctx.sent && ctx.subject) break;
    if (i - startIdx > 15) break;
  }
  return i;
}

/** Single-line header: "From: X To: Y Sent: Z Subject: W" */
function parseInlineHeader(line, ctx) {
  const fromM = line.match(/From:\s*([^T]+?)(?=\s+To:|\s+Sent:|\s+Subject:|$)/i);
  const toM = line.match(/To:\s*([^S]+?)(?=\s+Sent:|\s+From:|\s+Subject:|$)/i);
  const sentM = line.match(/Sent:\s*([^S]+?)(?=\s+Subject:|\s+From:|\s+To:|$)/i);
  const subjM = line.match(/Subject\s*:?\s*([^F]+?)(?=\s+From:|\s+To:|\s+Sent:|$)/i);
  if (fromM) ctx.from = fromM[1].trim();
  if (toM) ctx.to = toM[1].trim();
  if (sentM) ctx.sent = sentM[1].trim();
  if (subjM) ctx.subject = subjM[1].trim();
}

function parseEmailsFromParagraphs(paragraphs) {
  const emails = [];
  let i = 0;
  const HILLARY_SENT_INDICATORS = ['H ', 'H<', 'Hillary Clinton', 'HDR22@clintonemail.com', "H ", "'H "];

  while (i < paragraphs.length) {
    const line = paragraphs[i];
    const releaseMatch = line.match(RELEASE_START_PATTERN);
    if (!releaseMatch) {
      i++;
      continue;
    }
    const releaseType = releaseMatch[1];
    i++;
    const chunkStart = i;
    const chunk = [];
    let docNo = null;
    while (i < paragraphs.length) {
      const current = paragraphs[i];
      const extractedDocNo = matchDocNo(current);
      if (extractedDocNo) {
        docNo = extractedDocNo;
        i++;
        break;
      }
      if (RELEASE_START_PATTERN.test(current)) break;
      chunk.push(current);
      i++;
    }
    if (!docNo) continue;

    const ctx = { from: '', to: '', sent: '', subject: '', subjectSet: false };
    const headerLines = chunk.slice(0, 25);
    let bodyStartIdx = 0;
    for (let j = 0; j < headerLines.length; j++) {
      const current = headerLines[j];
      if (j <= 2 && /From:\s*.+\s+To:\s*.+\s+Sent:/i.test(current)) {
        parseInlineHeader(current, ctx);
        bodyStartIdx = j + 1;
        break;
      }
      if (/—\s*Original Message\s*—|Original Message/i.test(current)) continue;
      if (isHeaderLabel(current)) {
        bodyStartIdx = j + 1;
        continue;
      }
      const t = current.trim();
      if (t.match(/^From:\s*/i)) {
        const val = t.replace(/^From:\s*/i, '').trim();
        if (!/Sent:\s*.+To:\s/i.test(val)) { ctx.from = val; bodyStartIdx = j + 1; }
        continue;
      }
      if (t.match(/^Sent:\s*/i)) {
        const val = t.replace(/^Sent:\s*/i, '').trim();
        if (!/To:\s*.+Subject:/i.test(val)) { ctx.sent = val; bodyStartIdx = j + 1; }
        continue;
      }
      if (t.match(/^To:\s*/i)) { ctx.to = t.replace(/^To:\s*/i, '').trim(); bodyStartIdx = j + 1; continue; }
      if (t.match(/^Subject\s*:?\s*/i)) { ctx.subject = t.replace(/^Subject\s*:?\s*/i, '').trim(); bodyStartIdx = j + 1; continue; }
      if (t.match(/^Cc\s*:?\s*/i)) { bodyStartIdx = j + 1; continue; }
      if (t && t.length < 400 && parseHeaderLine(current, ctx)) {
        bodyStartIdx = j + 1;
      }
      if (j >= 12 && !ctx.subjectSet && t.length > 0 && t.length < 280 && !matchDocNo(current) && !RELEASE_START_PATTERN.test(t)) {
        ctx.subject = t;
        ctx.subjectSet = true;
        bodyStartIdx = j + 1;
      }
    }
    const bodyLines = chunk.slice(bodyStartIdx);
    const body = bodyLines
      .filter(l => !matchDocNo(l) && !RELEASE_START_PATTERN.test(l))
      .join('\n\n')
      .trim();
    const snippet = body.slice(0, 80).replace(/\s+/g, ' ').trim() + (body.length > 80 ? '…' : '');
    const isSent = HILLARY_SENT_INDICATORS.some(ind => (ctx.from || '').includes(ind) || (ctx.from || '').trim() === 'H');

    emails.push({
      id: docNo,
      docNo,
      releaseType,
      from: ctx.from || '',
      to: ctx.to || '',
      sent: ctx.sent || '',
      subject: ctx.subject || '(No subject)',
      body,
      snippet,
      isSent,
    });
  }

  return emails;
}

function buildPeopleIndex(emails) {
  const map = new Map();
  for (const e of emails) {
    const from = (e.from || '').trim();
    const to = (e.to || '').trim();
    if (from) {
      const key = from.toLowerCase();
      const entry = map.get(key) || { name: from, display: from, count: 0 };
      entry.count++;
      map.set(key, entry);
    }
    if (to) {
      const key = to.toLowerCase();
      const entry = map.get(key) || { name: to, display: to, count: 0 };
      entry.count++;
      map.set(key, entry);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function parseXmlFile(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  const xmlString = fs.readFileSync(resolved, 'utf8');
  const paragraphs = extractParagraphs(xmlString);
  const emails = parseEmailsFromParagraphs(paragraphs);
  const people = buildPeopleIndex(emails);
  return { emails, people };
}

module.exports = { parseXmlFile, parseEmailsFromParagraphs, extractParagraphs, buildPeopleIndex };
