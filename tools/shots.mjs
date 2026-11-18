// Captures the portfolio card screenshots: node tools/shots.mjs
// Phone shots: 600-wide JPEGs in prototype/shots. Desktop: 1440x900 JPEG at prototype/shots/web.jpg
// (copy it to the portfolio's assets/thumbs/web-petuniverse.jpg).
// Runs its own Vite dev server on a random port so it can import the game store and set up a pet
// (a Teen puppy called Biscuit in a flower crown and bow, plus a dragon) instead of clicking through adoption.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SHOTS = path.join(ROOT, 'prototype', 'shots');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(ROOT, '.shots-'));
const port = 5900 + Math.floor(Math.random() * 200), dbg = port + 1000;
const server = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=user-gesture-required',
  `--remote-debugging-port=${dbg}`, `--user-data-dir=${tmp}/profile`, 'about:blank'], { stdio: 'ignore' });

const SEED = `(async () => {
  const { useGame } = await import('/src/store/game.ts');
  const g = useGame.getState();
  g.resetGame?.();
  g.adopt('puppy', 'Biscuit');
  useGame.setState((s) => ({
    coins: 2450, gems: 46, tutorialStep: -1,
    settings: { ...s.settings, music: false, sfx: false, volume: 0 },
    owned: [...new Set([...s.owned, 'hat_flower', 'nk_bow', 'gl_round', 'hat_party', 'sofa', 'plant', 'rug'])],
    pets: s.pets.map((p) => ({ ...p, xp: 520, stage: 2, equipped: { hat: 'hat_flower', neck: 'nk_bow' },
      stats: { hunger: 82, happiness: 91, energy: 68, cleanliness: 74, health: 95, friendship: 63 } })),
    toasts: [], speech: null,
  }));
  return 'seeded ' + useGame.getState().pets.length + ' pet';
})()`;
const GO = (screen) => `(async () => { const { useGame } = await import('/src/store/game.ts'); useGame.setState({ screen: ${JSON.stringify(screen)}, toasts: [], speech: null }); return ${JSON.stringify(screen)}; })()`;

try {
  let ws;
  for (let i = 0; i < 80 && !ws; i++) {
    try { const p = (await (await fetch(`http://127.0.0.1:${dbg}/json`)).json()).find((t) => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {}
    if (!ws) await sleep(250);
  }
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = {};
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (pending[m.id]) { pending[m.id](m); delete pending[m.id]; } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const run = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value;
  const origin = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 80; i++) { try { if ((await fetch(origin)).ok) break; } catch {} await sleep(250); }

  const phone = () => send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const desktop = () => send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const shoot = async (name, width) => {
    const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
    const file = path.join(SHOTS, `${name}.jpg`);
    fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
    execFileSync('sips', ['--resampleWidth', String(width), file, '--out', file], { stdio: 'ignore' });
    console.log('shot', name);
  };

  await send('Runtime.enable');
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') console.log('page error', m.params.exceptionDetails?.exception?.description?.slice(0, 700)); });
  await phone();
  // First screen a new player sees: the adoption centre.
  await send('Page.navigate', { url: `${origin}/` }); await sleep(2500);
  await run('localStorage.clear()');
  await send('Page.navigate', { url: `${origin}/` }); await sleep(3000);
  await run(`[...document.querySelectorAll('button')].find((b) => b.textContent.includes('Enter Adoption'))?.click()`); await sleep(1800);
  await shoot('adopt', 600);

  console.log(await run(SEED));
  await send("Page.navigate", { url: `${origin}/` }); await sleep(3500);
  await send("Page.navigate", { url: `${origin}/` }); await sleep(3500);
  await run(GO('home')); await sleep(2500);
  console.log(await run(`document.getElementById('root').innerHTML.length + ' ' + document.body.innerText.slice(0, 80)`));
  await shoot('home', 600);
  for (const s of ['play', 'customize', 'explore', 'train', 'shop']) { await run(GO(s)); await sleep(1800); await shoot(s, 600); }

  await desktop();
  await run(GO('home')); await sleep(2500);
  await shoot('web', 1440);
} finally {
  chrome.kill(); server.kill();
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { setTimeout(() => fs.rmSync(tmp, { recursive: true, force: true }), 1500); }
}
setTimeout(() => process.exit(0), 2000);
