// Wraps `max dev` so the dev server URL is opened in the default browser
// once the listener is actually accepting connections.
//
// 之前依赖 stdout 字符串匹配（"App listening at" 等）来判断就绪——utoopack
// 现在打的是进度条而不是这些字面量，正则永远命中不了，浏览器就不会被打开。
//
// 参考 utooland/utoo#1267：mako 在 Rust 侧端口绑定后无条件 open；我们在
// Node 侧做不到 hook 端口绑定，等价做法是 TCP 探活——连得通就视为就绪，
// 浏览器随后会自动展示 utoopack 的 bundling 进度页，编译完成后页面会自动 reload。
const { spawn } = require('node:child_process');
const net = require('node:net');
const open = require('open');

const port = Number(process.env.PORT) || 8000;
const host = '127.0.0.1';
const url = `http://localhost:${port}`;

const maxBin = process.platform === 'win32' ? 'max.cmd' : 'max';
const child = spawn(maxBin, ['dev'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));

// 探活节奏：每 250ms 试一次，最多 60s；防止编译失败时无限重试。
const POLL_INTERVAL_MS = 250;
const POLL_TIMEOUT_MS = 60_000;
const startedAt = Date.now();
let opened = false;

const probe = () => {
  if (opened) return;
  if (Date.now() - startedAt > POLL_TIMEOUT_MS) return;

  const sock = net.connect({ port, host });
  sock.once('connect', () => {
    sock.destroy();
    if (opened) return;
    opened = true;
    open(url).catch(() => {
      // Best-effort：CI、远程开发等无桌面环境下打不开浏览器是预期内的，静默吞掉。
    });
  });
  sock.once('error', () => {
    sock.destroy();
    setTimeout(probe, POLL_INTERVAL_MS);
  });
};

setTimeout(probe, POLL_INTERVAL_MS);
