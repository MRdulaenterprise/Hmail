#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { parseXmlFile } = require('../server/parser');

const projectRoot = path.resolve(__dirname, '..');
const XML_PATH = process.env.XML_PATH || process.env.DATA_PATH || path.join(projectRoot, 'hillary-clinton-emails-august-31-release_daisy.xml');
const OUT_DIR = path.join(projectRoot, 'server', 'data');
const OUT_FILE = path.join(OUT_DIR, 'emails-index.json');

function main() {
  console.log('Parsing XML from', XML_PATH);
  const { emails, people } = parseXmlFile(XML_PATH);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({ emails, people }), 'utf8');
  console.log('Wrote', emails.length, 'emails,', people.length, 'people to', OUT_FILE);
}

main();
