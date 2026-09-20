/**
 * Full-page screenshot via Chrome DevTools Protocol (no npm deps; uses the
 * WebSocket global in Node >= 22).
 *
 * Usage:
 *   node scripts/screenshot.mjs <url> <out.png> [width=1440] [height=1000] [waitMs=2500]
 *
 * Captures beyond the viewport so 100vh-relative CSS still behaves like a
 * normal browser window (unlike --window-size hacks with headless --screenshot).
 */
import { spawn } from "node:child_process";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { tmpdir } from "node:os";

const [url, out, widthArg = "1440", heightArg = "1000", waitArg = "2500", clickSelector = ""] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: node scripts/screenshot.mjs <url> <out.png> [width] [height] [waitMs]");
  process.exit(1);
}
const width = Number(widthArg);
const height = Number(heightArg);
const waitMs = Number(waitArg);

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("No Chrome/Edge found");
  process.exit(1);
}

const port = 9222 + Math.floor(Math.random() * 500);
const profile = `${tmpdir()}\\cdp-profile-${port}`;
const proc = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTargets() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      return await res.json();
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome did not start");
}

try {
  const targets = await getTargets();
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method) {
      events.push(msg.method);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const mid = ++id;
      pending.set(mid, res);
      ws.send(JSON.stringify({ id: mid, method, params }));
    });

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url });

  // wait for load event
  for (let i = 0; i < 120; i++) {
    if (events.includes("Page.loadEventFired")) break;
    await sleep(250);
  }
  await sleep(waitMs);

  // Force-load lazy images by scrolling through the page once.
  await send("Runtime.evaluate", {
    expression: `(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y < h; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 400));
      return h;
    })()`,
    awaitPromise: true,
  });
  await sleep(600);

  // Optional: click one or more selectors (comma-separated) before capturing,
  // e.g. to open a dropdown or the mobile menu.
  if (clickSelector) {
    for (const sel of clickSelector.split(",")) {
      await send("Runtime.evaluate", {
        expression: `(() => { const el = document.querySelector(${JSON.stringify(sel.trim())}); if (el) { el.click(); return true; } return false; })()`,
        returnByValue: true,
      });
      await sleep(400);
    }
  }

  const hRes = await send("Runtime.evaluate", {
    expression: "document.documentElement.scrollHeight",
    returnByValue: true,
  });
  const measured = Number(hRes?.result?.result?.value ?? hRes?.result?.value);
  // When a click was requested we're capturing an interactive state (menu
  // open); capture just the viewport so Chrome doesn't resize the page (which
  // can trigger layout/hover changes). Otherwise capture the whole page.
  const fullHeight = clickSelector
    ? height
    : Math.min(Number.isFinite(measured) && measured > 0 ? measured : height, 20000);

  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: !clickSelector,
    clip: { x: 0, y: 0, width, height: fullHeight, scale: 1 },
  });
  if (!shot.result) {
    throw new Error(`captureScreenshot failed: ${JSON.stringify(shot.error ?? shot)}`);
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log(`Saved ${out} (${width}x${fullHeight})`);
  ws.close();
} finally {
  proc.kill();
}
