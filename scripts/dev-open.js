// Wraps `max dev` so the dev server URL is opened in the default browser
// once Umi reports the listener as ready. utoopack does not have a built-in
// auto-open option (the V5 webpack-open-browser plugin is incompatible).
const { spawn } = require('node:child_process');
const open = require('open');

const port = process.env.PORT || '8000';
const url = `http://localhost:${port}`;

const maxBin = process.platform === 'win32' ? 'max.cmd' : 'max';
const child = spawn(maxBin, ['dev'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  env: process.env,
});

let opened = false;
const readyPattern = /App listening at|ready in|on http:\/\/localhost/i;

child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  if (!opened && readyPattern.test(chunk.toString())) {
    opened = true;
    open(url).catch(() => {
      // Best-effort; fall back silently if the OS cannot launch a browser.
    });
  }
});

child.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
