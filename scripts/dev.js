const { spawn } = require('child_process');
const path = require('path');

const serverDir = path.join(__dirname, '..', 'server');
const clientDir = path.join(__dirname, '..', 'client');

process.env.XML_PATH = process.env.XML_PATH || path.join(__dirname, '..', 'hillary-clinton-emails-august-31-release_daisy.xml');

const server = spawn('node', ['--watch', 'index.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  env: { ...process.env, PORT: 3000 },
});

const client = spawn('npm', ['run', 'dev'], {
  cwd: clientDir,
  stdio: 'inherit',
  env: { ...process.env, VITE_API_URL: 'http://localhost:3000' },
});

function killAll() {
  server.kill();
  client.kill();
  process.exit(0);
}
process.on('SIGINT', killAll);
process.on('SIGTERM', killAll);
