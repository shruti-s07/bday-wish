/* ==========================================
 * EDIT ME: personalise the wish here
 ============================================ */
const CONFIG = {
  // The birthday person's name. Leave "" to keep it general.
  name: "Ananya",
  // Fallback sign-off if a letter has no "from" of its own.
  from: "Me",
  // Text printed at the bottom of the photostrip.
  stripLine: "Happy Birthday",
  // Date printed on the photostrip.
  stripDate: "October 19, 2026",
  // The three saved photos that print before the camera is turned on, per mode
  // (from memories.js). An empty list prints drawn placeholders.
  memories: typeof MEMORY_PHOTOS !== "undefined" ? MEMORY_PHOTOS : { cute: [], pretty: [] },
  letters: [
    {
      tag: "Letter one",
      title: "Open on your birthday",
      from: "Shruti",
      // Cute mode asks for this phrase before opening (capital letters don't matter).
      unlock: "i love shruti",
      paragraphs: [
        "Dear {name},",
        "Happy birthday! Today is all about you, and I hope it feels that way from the moment you wake up.",
        "I wanted to write this down instead of just saying it, because some things deserve more than a quick message. You make",
        "So today, eat the cake, take the long nap, and say yes to the extra dessert. You've earned every bit of it.",
      ],
      signoff: "With all my love,",
    },
    {
      tag: "Letter two",
      title: "Open when the candles are out",
      from: "Oishani",
      unlock: "i love oishani",
      paragraphs: [
        "Dear {name},",
        "Another year starts now, and I have a few wishes for you.",
        "I hope this year is kind to you. I hope it brings slow mornings, friends who make you laugh until it hurts, and at least",
        "On the hard days, and there will be a few, I hope you remember how loved you are. Keep this letter for those days.",
        "Here's to you, and to everything ahead.",
      ],
      signoff: "Always yours,",
    },
  ],
};

/* ========================================== */

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const displayName = CONFIG.name.trim();

/* ---------- mode toggle ---------- */
function currentMode() { return root.dataset.mode === "pretty" ? "pretty" : "cute"; }

function applyMode(mode) {
  root.dataset.mode = mode;
  document.querySelectorAll(".mode-opt").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === mode)));
  document.querySelectorAll("[data-cute]").forEach((el) => { el.textContent = el.dataset[mode]; });
}

function switchMode(mode, originEl) {
  if (mode === currentMode()) return;
  if (originEl) {
    const r = originEl.getBoundingClientRect();
    root.style.setProperty("--vt-x", `${r.left + r.width / 2}px`);
    root.style.setProperty("--vt-y", `${r.top + r.height / 2}px`);
  }
  if (document.startViewTransition && !reduceMotion) {
    document.startViewTransition(() => applyMode(mode));
  } else {
    applyMode(mode);
  }
  setTimeout(() => burst(window.innerWidth / 2, window.innerHeight * 0.3, 90), 250);
  relockLetters();
  resetBooth();
}

// Every mode switch closes the envelopes/folders and asks for the phrase again.
function relockLetters() {
  unlocked.clear();
  document.querySelectorAll(".envelope.open").forEach((env) => env.classList.remove("open"));
  ["letterDialog", "lockDialog", "sysDialog"].forEach((id) => {
    const d = document.getElementById(id);
    if (d && d.open) d.close();
  });
}

document.querySelectorAll(".mode-opt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (mode === currentMode()) return;
    if (mode === "pretty") openSys({ message: ["launch pretty version"], onOk: () => switchMode("pretty", btn) });
    else openCuteLaunch(() => switchMode("cute", btn));
  });
});

// True while the banner dashboard fills the middle of the screen.
function onFirstDashboard() {
  const r = document.getElementById("celebrate").getBoundingClientRect();
  return r.top <= innerHeight * 0.5 && r.bottom >= innerHeight * 0.5;
}

// The site always opens in cute mode.
applyMode("cute");

/* ---------- pretty photobooth ornaments ---------- */
(function ornaments() {
  const corner = `<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
    <path d="M3 57 V22 Q3 3 22 3 H57"/>
    <path d="M9 50 V25 Q9 9 25 9 H50" opacity=".6"/>
    <path d="M17 31 c-6 0 -8 -8 -10 c4 -1 6 3 3 5"/>
    <path d="M31 17 c0 -6 -8 -8 -10 -2 c-1 4 3 6 5 3"/>
    <path d="M20 20 c6 6 12 8 18 6 M20 20 c6 6 8 12 6 18"/>
    <circle cx="20" cy="20" r="2.2" fill="currentColor" stroke="none"/>
    <path d="M40 9 q5 -4 9 0 M9 40 q-4 5 0 9"/>
  </svg>`;
  
  const bow = `<svg viewBox="0 0 120 34">
    <g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".75">
      <path d="M2 17 H26 M94 17 H118"/>
    </g>
    <g fill="currentColor">
      <circle cx="6" cy="17" r="1.6"/><circle cx="14" cy="17" r="1.6"/><circle cx="106" cy="17" r="1.6"/><circle cx="114" cy="17" r="1.6"/>
      <path d="M60 17 C50 3 30 4 32 17 C30 30 50 31 60 17 Z" opacity=".9"/>
      <path d="M60 17 C70 3 90 4 88 17 C90 30 70 31 60 17 Z" opacity=".9"/>
      <path d="M57 19 L49 32 L54 30 L56 33 Z M63 19 L71 32 L66 30 L64 33 Z"/>
      <circle cx="60" cy="17" r="5"/>
    </g>
    <g fill="none" stroke="#4D061C" stroke-width="1" opacity=".55">
      <path d="M58 16 C52 9 40 9 39 16 M62 16 C68 9 80 9 81 16"/>
    </g>
  </svg>`;

  document.querySelectorAll(".orn").forEach((el) => { el.innerHTML = corner; });
  document.querySelectorAll(".bow").forEach((el) => { el.innerHTML = bow; });

  // scalloped badge outline for the pretty print button
  const pts = [];
  const bumps = 18, steps = bumps * 8;
  for (let k = 0; k < steps; k++) {
    const a = (k / steps) * Math.PI * 2;
    const r = 44 + 6 * Math.abs(Math.cos((a * bumps) / 2));
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)}% ${(50 + Math.sin(a) * r).toFixed(2)}%`);
  }
  root.style.setProperty("--scallop", `polygon(${pts.join(",")})`);
})();

/* ---------- confetti ---------- */
const cv = document.getElementById("confetti");
const ctx = cv.getContext("2d");
let parts = [];
let raf = null;

function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = innerWidth * dpr;
  cv.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeCanvas();
addEventListener("resize", sizeCanvas);

function token(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
/* ---------- pixel art ---------- */
// Each string is a row; each character maps to a fill colour in `colors` ("." = empty).
const PIXEL = {
  heart: [
    ".00...00.",
    "OPPO.OPPO",
    "OPWPOPPPO",
    "OPPPPPPPP",
    ".OPPPPPO.",
    "..OPPPO..",
    "...OPO...",
    "....O....",
  ],
  smallHeart: [
    ".XX.XX.",
    "XXXXXXX",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
    "...X...",
  ],
  cross: [
    "XX...XX",
    ".XX.XX.",
    "..XXX..",
    ".XX.XX.",
    "XX...XX",
  ],
};

function pixelSVG(rows, colors, size) {
  const h = rows.length, w = rows[0].length;
  let rects = "";
  rows.forEach((row, y) => { [...row].forEach((ch, x) => {
    if (colors[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${colors[ch]}"/>`;
  })});
  return `<svg class="px-art" viewBox="0 0 ${w} ${h}" width="${w * size}" height="${h * size}" aria-hidden="true" shape-rendering="crispEdges">${rects}</svg>`;
}

function drawPixels(g, rows, colors, x, y, size) {
  rows.forEach((row, ry) => { [...row].forEach((ch, rx) => {
    if (!colors[ch]) return;
    g.fillStyle = colors[ch];
    g.fillRect(x + rx * size, y + ry * size, size, size);
  })});
}

function burst(x, y, count = 120) {
  if (reduceMotion) return;
  const pretty = currentMode() === "pretty";
  const palette = pretty
    ? [token("--accent"), token("--accent-2"), token("--accent-3"), "#FFFFFF"]
    : [token("--flag-1"), token("--flag-2"), token("--flag-3"), token("--flag-4")];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = 4 + Math.random() * 8;
    parts.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 6,
      r: 4 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: palette[i % palette.length],
      shape: pretty ? (i % 3 === 0 ? "heart" : "petal") : ["circle", "rect", "star"][i % 3],
      life: 1,
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

function drawShape(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = Math.max(p.life, 0);
  ctx.fillStyle = p.color;
  const r = p.r;
  ctx.beginPath();
  if (p.shape === "circle") ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
  else if (p.shape === "rect") ctx.rect(-r, -r * 0.45, r * 2, r * 0.9);
  else if (p.shape === "star") {
    for (let k = 0; k < 10; k++) {
      const rad = k % 2 ? r * 0.45 : r;
      const ang = (k * Math.PI) / 5;
      ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
    ctx.closePath();
  } else if (p.shape === "heart") {
    ctx.moveTo(0, r * 0.35);
    ctx.bezierCurveTo(r, -r * 0.4, r * 0.5, -r * 1.1, 0, -r * 0.45);
    ctx.bezierCurveTo(-r * 0.5, -r * 1.1, -r, -r * 0.4, 0, r * 0.35);
  } else {
    ctx.ellipse(0, 0, r, r * 0.45, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  if (p.color.toUpperCase() === "#FFFFFF") { ctx.strokeStyle = "rgba(0,0,0,.15)"; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.restore();
}

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts.forEach((p) => {
    p.vy += 0.25;
    p.vx *= 0.985;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.006;
    drawShape(p);
  });
  parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 40);
  raf = parts.length ? requestAnimationFrame(tick) : null;
  if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function welcomeBurst() {
  setTimeout(() => burst(innerWidth * 0.25, innerHeight * 0.35, 80), 150);
  setTimeout(() => burst(innerWidth * 0.75, innerHeight * 0.35, 80), 400);
}

/* ---------- dotted swirl background (cute mode) ---------- */
function seeded(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

// Draw curly flourishes as strokes, then resample them onto a grid of square dots.
function swirlImage(seed, size, color) {
  const rnd = seeded(seed);
  const src = document.createElement("canvas");
  src.width = src.height = size;
  const g = src.getContext("2d");
  g.strokeStyle = "#000";
  g.lineCap = "round";
  const band = size * 0.045;

  const spiral = (cx, cy, r, turns, dir, start) => {
    g.beginPath();
    const steps = 140;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const a = start + dir * t * turns * Math.PI * 2;
      const rr = r * (1 - t * 0.88);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      k ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.lineWidth = band;
    g.stroke();
    return { x: cx + Math.cos(start) * r, y: cy + Math.sin(start) * r };
  };

  const hub = { x: size * (0.42 + rnd() * 0.16), y: size * (0.42 + rnd() * 0.16) };
  const count = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + rnd() * 0.8;
    const dist = size * (0.22 + rnd() * 0.1);
    const r = size * (0.09 + rnd() * 0.07);
    const cx = hub.x + Math.cos(ang) * dist, cy = hub.y + Math.sin(ang) * dist;
    const end = spiral(cx, cy, r, 1.6 + rnd() * 0.6, rnd() > 0.5 ? 1 : -1, ang + Math.PI);
    // vine back to the hub
    g.beginPath();
    g.moveTo(end.x, end.y);
    g.quadraticCurveTo(hub.x + Math.cos(ang + 0.9) * dist * 0.6, hub.y + Math.sin(ang + 0.9) * dist * 0.6, hub.x, hub.y);
    g.lineWidth = band * 0.7;
    g.stroke();
    // a small curl off each vine
    spiral(cx + (hub.x - cx) * 0.5, cy + (hub.y - cy) * 0.5, r * 0.45, 1.3, rnd() > 0.5 ? 1 : -1, rnd() * 6);
  }
  // leaf outlines
  for (let i = 0; i < 4; i++) {
    g.save();
    g.translate(hub.x + (rnd() - 0.5) * size * 0.35, hub.y + (rnd() - 0.5) * size * 0.35);
    g.rotate(rnd() * Math.PI);
    g.beginPath();
    g.ellipse(0, 0, size * 0.05, size * 0.022, 0, 0, Math.PI * 2);
    g.lineWidth = band * 0.5;
    g.stroke();
    g.restore();
  }

  const data = g.getImageData(0, 0, size, size).data;
  const out = document.createElement("canvas");
  out.width = out.height = size;
  const o = out.getContext("2d");
  o.fillStyle = color;
  // same dot grid at every size, like the reference
  const cell = 6;
  const dot = 3;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const a = data[((y + (cell >> 1)) * size + x + (cell >> 1)) * 4 + 3];
      if (a > 60 && rnd() > 0.08) o.fillRect(x, y, dot, dot);
    }
  }
  return out.toDataURL("image/png");
}

(function buildSwirls() {
  const layer = document.getElementById("swirls");
  const yellow = "#FBEEAC";
  // [seed, size px, left %, top %, rotation deg]
  const placed = [
    // large
    [11, 680, -14, -6, 0],
    [83, 720, 68, 44, 160],
    [131, 620, 18, 62, 250],
    [29, 560, 72, -14, 40],
    // medium
    [47, 340, 40, 58, -25],
    [61, 400, -10, 74, 210],
    [149, 360, 44, -8, 95],
    [173, 320, 86, 24, 330],
    // small
    [5, 200, 26, 34, 80],
    [97, 170, 60, 20, 300],
    [37, 230, 90, 86, 120],
    [191, 150, 6, 44, 15],
    [211, 190, 52, 88, 190],
    [223, 140, 34, 8, 270],
    [239, 210, 64, 66, 60],
    [251, 160, 94, 4, 140],
  ];
  const scale = Math.max(0.5, Math.min(1, innerWidth / 1200));
  placed.forEach(([seed, fullSize, left, top, rot]) => {
    const size = Math.round(fullSize * scale);
    const img = new Image();
        img.src = swirlImage(seed, size, yellow);
    img.alt = "";
    img.width = img.height = size;
    img.style.left = `${left}%`;
    img.style.top = `${top}%`;
    img.style.transform = `rotate(${rot}deg)`;
    layer.appendChild(img);
  });
})();

/* ---------- launch pop-up (cute mode) ---------- */
const launch = document.getElementById("launch");
const SKY = { X: "#E3F1FF" };
document.querySelectorAll(".launch-hearts").forEach((el) => { el.innerHTML = pixelSVG(PIXEL.smallHeart, SKY, 3).repeat(3); });
document.querySelectorAll(".launch-x").forEach((el) => { el.innerHTML = pixelSVG(PIXEL.cross, SKY, 4); });
document.querySelectorAll(".marquee-hearts").forEach((el) => { el.innerHTML = pixelSVG(PIXEL.heart, { O: "#3B2A3F", P: "#FCF4DC", W: "#FFFFFF" }, 4).repeat(3); });
document.querySelectorAll(".launch-heart").forEach((el) => { el.innerHTML = pixelSVG(PIXEL.heart, { O: "#4F94D6", P: "#A2D2FF", W: "#FFFFFF" }, 3); });

let launchOk = null;

function openCuteLaunch(onOk) {
  launchOk = onOk;
  document.getElementById("launchTitle").textContent = "launch cute version";
  launch.hidden = false;
  root.classList.add("locked");
  document.getElementById("launchGo").focus();
}

function closeLaunch(accept) {
  if (launch.hidden || launch.classList.contains("leaving")) return;
  const run = accept ? launchOk : null;
  launchOk = null;
  launch.classList.add("leaving");
  setTimeout(() => {
    launch.hidden = true;
    launch.classList.remove("leaving");
    root.classList.remove("locked");
    if (run) run();
  }, reduceMotion ? 0 : 450);
}
document.getElementById("launchGo").addEventListener("click", () => closeLaunch(true));
document.getElementById("launchX").addEventListener("click", () => closeLaunch(false));
launch.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLaunch(false); });

addEventListener("load", welcomeBurst);

/* ---------- candle wish ---------- */
const flame = document.getElementById("flame");
const smoke = document.getElementById("smoke");
let blown = false;
function blowCandle() {
  if (blown) return;
  blown = true;
  flame.classList.add("out");
  smoke.classList.remove("puff");
  void smoke.getBBox();
  smoke.classList.add("puff");
  const r = flame.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 140);
  setTimeout(() => {
    flame.classList.remove("out");
    blown = false;
  }, 3500);
}
flame.addEventListener("click", blowCandle);
flame.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blowCandle(); } });

/* ---------- side dots ---------- */
const dots = document.querySelectorAll(".dot");
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) dots.forEach((d) => d.classList.toggle("is-active", d.dataset.target === en.target.id));
  });
}, { threshold: 0.5 });
document.querySelectorAll(".panel").forEach((p) => io.observe(p));

/* ==========================================================
   PHOTOBOOTH
   ========================================================== */
const video = document.getElementById("video");
const screenIdle = document.getElementById("screenIdle");
const countdownEl = document.getElementById("countdown");
const flashEl = document.getElementById("flash");
const shotDots = [...document.querySelectorAll("#shotDots i")];
const printBtn = document.getElementById("printBtn");
const takeMemoriesBtn = document.getElementById("takeMemories");
const screenPrintBtn = document.getElementById("screenPrint");
const livePrintBtn = document.getElementById("livePrint");
const screenEl = document.getElementById("screen");
const statusEl = document.getElementById("boothStatus");
const stripImg = document.getElementById("stripImg");
const stripPlaceholder = document.getElementById("stripPlaceholder");
const downloadBtn = document.getElementById("downloadBtn");

const FILTERS = {
  none: "none",
  rosy: "saturate(1.25) sepia(0.12) hue-rotate(-12deg) brightness(1.05)",
  vintage: "sepia(0.45) contrast(1.05) brightness(1.05) saturate(0.9)",
  mono: "grayscale(1) contrast(1.12)",
};
let filterKey = "none";
let stream = null;
let busy = false;
let stripCanvas = null;
let boothRun = 0; // bumped by resetBooth() so an in-progress print stops
const SHOTS = 3;
const SHOT_W = 720;
const SHOT_H = 720;

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    filterKey = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) => {
      c.classList.toggle("is-on", c === chip);
      c.setAttribute("aria-checked", String(c === chip));
    });
    video.style.filter = FILTERS[filterKey];
  });
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function setStatus(msg) { statusEl.textContent = msg; }

async function startCamera() {
  if (stream) return true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus("This browser can't open the camera here. Press print to use your saved memories.");
    return false;
  }
  try {
    setStatus("Asking for camera permission...");
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play().catch(() => {});
    screenIdle.hidden = true;
    screenEl.classList.add("live");
    takeMemoriesBtn.hidden = true;
    setStatus("Camera ready. Press print when you're set.");
    return true;
  } catch (err) {
    const denied = err && (err.name === "NotAllowedError" || err.name === "SecurityError");
    const fallback = "press print to use your saved memories";
    setStatus(denied
      ? `Camera permission was blocked. Allow it in your browser's address bar, or ${fallback}.`
      : `No camera was found, so ${fallback}.`);
    return false;
  }
}
takeMemoriesBtn.addEventListener("click", () => { if (!busy) startCamera(); });

// Crop any source to the frame shape (cover) and apply the chosen filter.
function frameFrom(source, sw, sh, mirror) {
  const c = document.createElement("canvas");
  c.width = SHOT_W;
  c.height = SHOT_H;
  const g = c.getContext("2d");
  const target = SHOT_W / SHOT_H;
  let cw = sw, ch = sh;
  if (sw / sh > target) cw = sh * target; else ch = sw / target;
  const cx = (sw - cw) / 2, cy = (sh - ch) / 2;
  g.filter = FILTERS[filterKey];
  if (mirror) { g.translate(SHOT_W, 0); g.scale(-1, 1); }
  g.drawImage(source, cx, cy, cw, ch, 0, 0, SHOT_W, SHOT_H);
  return c;
}

async function countdown() {
  for (const n of [3, 2, 1]) {
    countdownEl.textContent = n;
    countdownEl.classList.remove("tick");
    void countdownEl.offsetWidth;
    countdownEl.classList.add("tick");
    await sleep(850);
  }
  countdownEl.textContent = "";
}

function flash() {
  flashEl.classList.remove("go");
  void flashEl.offsetWidth;
  flashEl.classList.add("go");
}

function setBusy(on) {
  busy = on;
  printBtn.disabled = on;
  takeMemoriesBtn.disabled = on;
  screenPrintBtn.disabled = on;
  screenEl.classList.toggle("busy", on);
  downloadBtn.disabled = on || !stripCanvas;
}

async function shootWithCamera() {
  const run = ++boothRun;
  const ok = await startCamera();
  if (!ok || run !== boothRun) return;
  setBusy(true);
  resetStrip();
  shotDots.forEach((d) => d.classList.remove("done"));
  const shots = [];
  for (let i = 0; i < SHOTS; i++) {
    setStatus(`Photo ${i + 1} of ${SHOTS}. Smile!`);
    await countdown();
    if (run !== boothRun) return;
    flash();
    shots.push(frameFrom(video, video.videoWidth || SHOT_W, video.videoHeight || SHOT_H, true));
    shotDots[i].classList.add("done");
    await sleep(i < SHOTS - 1 ? 650 : 300);
    if (run !== boothRun) return;
  }
  await printStrip(shots, false, run);
}

printBtn.addEventListener("click", () => {
  if (busy) return;
  if (!stream) printMemories();
  else shootWithCamera();
});

function placeholderMemory(n) {
  const c = document.createElement("canvas");
  c.width = SHOT_W;
  c.height = SHOT_H;
  const g = c.getContext("2d");
  if (currentMode() === "cute") {
    g.fillStyle = "#A2D2FF";
    g.fillRect(0, 0, SHOT_W, SHOT_H);
    g.fillStyle = "#FBEEAC";
    for (let y = 10; y < SHOT_H; y += 22) for (let x = (y / 22) % 2 ? 21 : 10; x < SHOT_W; x += 22) g.fillRect(x, y, 6, 6);
    const cx = SHOT_W / 2, cy = SHOT_H / 2;
    g.fillStyle = "#3B2A3F";
    g.fillRect(cx - 250, cy - 150, 500, 300);
    g.fillStyle = "#FCF4DC";
    g.fillRect(cx - 242, cy - 142, 484, 284);
    drawPixels(g, PIXEL.heart, { O: "#3B2A3F", P: "#EEB6E8", W: "#FFFFFF" }, cx - 36, cy - 110, 8);
    g.textAlign = "center";
    g.fillStyle = "#3B2A3F";
    g.font = '700 64px "Pixelify Sans", "Courier New", monospace';
    g.fillText(`memory ${n}`, cx, cy + 30);
    g.font = '34px "VT323", "Courier New", monospace';
    g.fillText("your photo goes here", cx, cy + 90);
    return c;
  }
  const bg = g.createRadialGradient(SHOT_W / 2, SHOT_H * 0.45, 40, SHOT_W / 2, SHOT_H / 2, SHOT_W * 0.65);
  bg.addColorStop(0, "#6E1430");
  bg.addColorStop(0.6, "#4D061C");
  bg.addColorStop(1, "#140F0F");
    g.fillStyle = bg;
  g.fillRect(0, 0, SHOT_W, SHOT_H);
  g.strokeStyle = "rgba(195,192,183,.7)";
  g.lineWidth = 3;
  g.strokeRect(40, 40, SHOT_W - 80, SHOT_H - 80);
  g.lineWidth = 1;
  g.strokeRect(54, 54, SHOT_W - 108, SHOT_H - 108);
  g.fillStyle = "#C3C0B7";
  g.textAlign = "center";
  g.font = '96px "Pinyon Script", "Snell Roundhand", cursive';
  g.fillText(`memory ${n}`, SHOT_W / 2, SHOT_H / 2 + 20);
  g.font = 'italic 30px "Cormorant Garamond", Georgia, serif';
  g.fillText("your photo goes here", SHOT_W / 2, SHOT_H / 2 + 80);
  return c;
}

function loadSrc(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function printMemories() {
  const run = ++boothRun;
  setBusy(true);
  resetStrip();
  shotDots.forEach((d) => d.classList.remove("done"));
  setStatus("Loading your memories...");
  try { await document.fonts.ready; } catch (e) { /* ignore */ }
  const shots = [];
  const saved = CONFIG.memories[currentMode()] || [];
  for (let i = 0; i < SHOTS; i++) {
    const src = saved[i];
    let frame;
    if (src) {
      try {
        const img = await loadSrc(src);
        frame = frameFrom(img, img.naturalWidth, img.naturalHeight, false);
        frame.getContext("2d").getImageData(0, 0, 1, 1); // throws if the browser won't let this photo be saved
      } catch (e) { frame = null; }
    }
    shots.push(frame || frameFrom(placeholderMemory(i + 1), SHOT_W, SHOT_H, false));
    shotDots[i].classList.add("done");
    await sleep(reduceMotion ? 0 : 350);
    if (run !== boothRun) return;
  }
  await printStrip(shots, false, run);
}

screenPrintBtn.addEventListener("click", () => { if (!busy) printMemories(); });
livePrintBtn.addEventListener("click", () => { if (!busy) shootWithCamera(); });

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function heartPath(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y + s * 0.35);
  g.bezierCurveTo(x + s, y - s * 0.4, x + s * 0.5, y - s * 1.1, x, y - s * 0.45);
  g.bezierCurveTo(-x * 0.5, y - s * 1.1, x - s, y - s * 0.4, x, y + s * 0.35);
  g.fill();
}

// Pretty mode: an old film strip with sprocket holes down both edges.
function composeFilm(shots) {
  const W = 640, H = 1996, M = 72, PW = W - M * 2, PH = PW, TOP = 46, GAP = 28;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const base = g.createLinearGradient(0, 0, W, 0);
  base.addColorStop(0, "#0E0A0A");
  base.addColorStop(0.5, "#1C1515");
  base.addColorStop(1, "#0E0A0A");
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  // sprocket holes
  g.fillStyle = "#E6E3DC";
  for (let y = 14; y < H - 20; y += 40) {
    roundRect(g, 22, y, 28, 19, 4); g.fill();
    roundRect(g, W - 50, y, 28, 19, 4); g.fill();
  }

  shots.forEach((shot, i) => {
    const y = TOP + i * (PH + GAP);
    g.fillStyle = "#000";
    g.fillRect(M - 4, y - 4, PW + 8, PH + 8);
    g.drawImage(shot, M, y, PW, PH);
    // aged warm wash + vignette
    g.globalAlpha = 0.16;
    g.fillStyle = "#C3A27A";
    g.fillRect(M, y, PW, PH);
    g.globalAlpha = 1;
    const v = g.createRadialGradient(M + PW / 2, y + PH / 2, PH * 0.3, M + PW / 2, y + PH / 2, PW * 0.68);
    v.addColorStop(0, "rgba(20,15,15,0)");
    v.addColorStop(1, "rgba(20,15,15,.55)");
    g.fillStyle = v;
    g.fillRect(M, y, PW, PH);
    // frame number in the margin
    g.fillStyle = "rgba(195,192,183,.6)";
    g.font = '18px "Cormorant Garamond", Georgia, serif';
    g.textAlign = "left";
    g.fillText(`${i + 1}A`, M, y + PH + 21);
  });

  const fy = TOP + SHOTS * PH + (SHOTS - 1) * GAP;
  const cx = W / 2;
  g.textAlign = "center";
  const silver = g.createLinearGradient(cx - 220, 0, cx + 220, 0);
  silver.addColorStop(0, "#8B857D");
  silver.addColorStop(0.35, "#F4F2EE");
  silver.addColorStop(0.6, "#C3C0B7");
  silver.addColorStop(1, "#8B857D");
  g.fillStyle = silver;
  g.shadowColor = "rgba(195,192,183,.45)";
  g.shadowBlur = 18;
  g.font = '82px "Pinyon Script", "Snell Roundhand", cursive';
  g.fillText(CONFIG.stripLine, cx, fy + 140);
  g.shadowBlur = 0;
  g.fillStyle = "#C3C0B7";
  g.font = 'italic 28px "Cormorant Garamond", Georgia, serif';
  const dateStr = CONFIG.stripDate;
  g.fillText(displayName ? `${displayName} · ${dateStr}` : dateStr, cx, fy + 200);
  g.strokeStyle = "rgba(195,192,183,.6)";
  g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(cx - 150, fy + 238); g.lineTo(cx - 20, fy + 238); g.moveTo(cx + 20, fy + 238); g.lineTo(cx + 150, fy + 238); g.stroke();
  g.fillStyle = "#C3C0B7";
  g.beginPath(); g.moveTo(cx, fy + 228); g.lineTo(cx + 8, fy + 238); g.lineTo(cx, fy + 248); g.lineTo(cx - 8, fy + 238); g.closePath(); g.fill();
  return c;
}

async function composeStrip(shots) {
  try { await document.fonts.ready; } catch (e) { /* ignore */ }
  const pretty = currentMode() === "pretty";
  if (pretty) return composeFilm(shots);
  const W = 640, H = 1996, PAD = 36, PW = 568, PH = 568, GAP = 22;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const bg = token("--strip-bg"), dot = token("--strip-dot"), ink = token("--strip-ink");
  const accent = token("--accent"), gold = token("--accent-2");

  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  if (!pretty) {
    g.fillStyle = dot;
    for (let y = 8; y < H; y += 24) {
      for (let x = (y / 24) % 2 ? 20 : 8; x < W; x += 24) g.fillRect(x, y, 8, 8);
    }
  } else {
    g.strokeStyle = gold;
    g.lineWidth = 2;
    g.strokeRect(12, 12, W - 24, H - 24);
    g.lineWidth = 1;
    g.strokeRect(19, 19, W - 38, H - 38);
  }

  shots.forEach((shot, i) => {
    const y = PAD + i * (PH + GAP);
    g.save();
    if (!pretty) {
      g.fillStyle = ink;
      g.fillRect(PAD - 6, y - 6, PW + 12, PH + 12);
      g.fillStyle = "rgba(46, 36, 64, .25)";
      g.fillRect(PAD + 6, y + PH + 6, PW + 6, 6);
      g.fillRect(PAD + PW + 6, y + 6, 6, PH + 6);
    }
    roundRect(g, PAD, y, PW, PH, pretty ? 3 : 0);
    g.clip();
    g.drawImage(shot, PAD, y, PW, PH);
    g.restore();
  });

  const fy = PAD + PH * SHOTS + GAP * (SHOTS - 1);
  const cx = W / 2;
  g.textAlign = "center";
  g.textBaseline = "alphabetic";
  if (pretty) {
    g.fillStyle = accent;
    g.font = '72px "Pinyon Script", "Snell Roundhand", cursive';
    g.fillText(CONFIG.stripLine, cx, fy + 92);
    g.fillStyle = ink;
    g.font = 'italic 26px "Cormorant Garamond", Georgia, serif';
  } else {
    g.font = '700 52px "Pixelify Sans", "Courier New", monospace';
    g.fillStyle = ink;
    g.fillText(CONFIG.stripLine.toLowerCase(), cx + 4, fy + 86);
    g.fillStyle = accent;
    g.fillText(CONFIG.stripLine.toLowerCase(), cx, fy + 82);
    g.fillStyle = ink;
    g.font = '28px "VT323", "Courier New", monospace';
  }
  const dateStr = CONFIG.stripDate;
  g.fillText(displayName ? `${displayName} · ${dateStr}` : dateStr, cx, fy + 132);

  if (pretty) {
    g.fillStyle = gold;
    heartPath(g, cx - 150, fy + 160, 10);
    heartPath(g, cx, fy + 166, 12);
    heartPath(g, cx + 150, fy + 160, 10);
  } else {
    const hc = { O: ink, P: accent, W: "#FFFFFF" };
    drawPixels(g, PIXEL.heart, hc, cx - 168, fy + 146, 4);
    drawPixels(g, PIXEL.heart, hc, cx - 18, fy + 146, 4);
    drawPixels(g, PIXEL.heart, hc, cx + 132, fy + 146, 4);
  }
  return c;
}

async function printStrip(shots, keepStatus, run) {
  if (!keepStatus) setStatus("Printing your strip...");
  const canvas = await composeStrip(shots);
  if (run !== boothRun) return;
  stripCanvas = canvas;
  stripImg.src = stripCanvas.toDataURL("image/png");
  await new Promise((r) => { if (stripImg.complete) r(); else stripImg.onload = r; });
  stripPlaceholder.hidden = true;
  stripImg.hidden = false;
  stripImg.classList.remove("printed", "printing");
  void stripImg.offsetWidth;
  stripImg.classList.add("printing");
  await sleep(reduceMotion ? 50 : 3700);
  if (run !== boothRun) return;
  stripImg.classList.replace("printing", "printed");
  const r = stripImg.getBoundingClientRect();
  burst(r.left + r.width / 2, Math.min(r.bottom, innerHeight) - 40, 90);
  if (!keepStatus) setStatus("All done! Download your strip below.");
  setBusy(false);
}

function resetStrip() {
  stripImg.hidden = true;
  stripImg.classList.remove("printed", "printing");
  stripPlaceholder.hidden = false;
}

// Back to the "load memories" screen: camera off, strip cleared, nothing running.
function resetBooth() {
  boothRun++;
  if (stream) {
      stream.getTracks().forEach((t) => t.stop());
  stream = null;
  video.srcObject = null;
}
  screenEl.classList.remove("live");
  screenIdle.hidden = false;
  takeMemoriesBtn.hidden = false;
  countdownEl.textContent = "";
  countdownEl.classList.remove("tick");
  stripCanvas = null;
  resetStrip();
  shotDots.forEach((d) => d.classList.remove("done"));
  setStatus("");
  setBusy(false);
}

downloadBtn.addEventListener("click", () => {
  if (!stripCanvas) return;
  stripCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `birthday-photostrip-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus("Saved to your downloads.");
  }, "image/png");
});

/* ==========================================================
   LETTERS
   ========================================================== */
const mailbox = document.getElementById("mailbox");
const dialog = document.getElementById("letterDialog");
const letterTag = document.getElementById("letterTag");
const letterTitle = document.getElementById("letterTitle");
const letterBody = document.getElementById("letterBody");

const SEAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="#fff"/></svg>';

// Ornate, embossed flap for the pretty envelopes.
function envelopeFlap(i) {
  const id = `scroll${i}`;
  return `<svg class="env-flap-svg" viewBox="0 0 300 124" aria-hidden="true">
    <defs>
      <g id="${id}" fill="none" stroke-linecap="round">
        <path d="M150 22 c-11 10 -11 24 0 32 c11 -8 11 -22 0 -32 z"/>
        <path d="M150 54 v12 M142 40 c-8 -4 -14 2 -10 8 M158 40 c8 -4 14 2 10 8"/>
        <path d="M150 70 c-20 0 -32 -14 -54 -14 c-12 0 -16 10 -8 14 c6 3 10 -3 6 -6"/>
        <path d="M150 70 c20 0 32 -14 54 -14 c12 0 16 10 8 14 c-6 3 -10 -3 -6 -6"/>
        <path d="M58 22 c10 -6 26 -2 28 8 c2 8 -12 -12 6 M30 14 c6 6 16 6 22 2"/>
        <path d="M242 22 c-10 -6 -26 -2 -28 8 c-2 8 12 -12 -6 M270 14 c-6 6 -16 6 -22 2"/>
        <circle cx="150" cy="104" r="7"/>
        <path d="M120 84 c8 8 20 10 30 6 M180 84 c-8 8 -20 10 -30 6"/>
      </g>
    </defs>
    <path d="M0 0 H300 V10 C292 22 280 26 268 24 C262 34 250 40 238 38 C228 52 212 58 198 56 C190 70 178 76 168 74 C166 84 162 92 156 96 C162 104 160 116 150 120 C140 116 138 104 144 96 C138 92 134 84 132 74 C122 76 110 70 102 56 C88 58 72 52 62 38 C50 40 38 34 32 24 C20 26 8 22 0 10 Z" fill="var(--env)"/>
    <path d="M0 10 C8 22 20 26 32 24 C38 34 50 40 62 38 C72 52 88 58 102 56 C110 70 122 76 132 74 C134 84 138 92 144 96 C138 104 140 116 150 120 C160 116 162 104 156 96 C162 92 166 84 168 74 C178 76 190 70 198 56 C212 58 228 52 238 38 C250 40 262 34 268 24 C280 26 292 22 300 10" fill="none" stroke="#F4F2EE" stroke-width="1.2" opacity=".7"/>
    <use href="#${id}" stroke="#F7F5F1" stroke-width="2.2" transform="translate(-0.9 -0.9)"/>
    <use href="#${id}" stroke="rgba(70,58,50,.45)" stroke-width="2.2" transform="translate(0.9 0.9)"/>
    <use href="#${id}" stroke="var(--env)" stroke-width="1.8"/>
  </svg>`;
}

const FOLDER_HEART = pixelSVG(PIXEL.heart, { O: "#2E2440", P: "#EEB6E8", W: "#FFFFFF" }, 6);
const fileNames = ["letter_one.txt", "letter_two.txt"];

CONFIG.letters.forEach((letter, i) => {
  const card = document.createElement("div");
  card.className = "letter-card";
  card.innerHTML = `
    <button type="button" class="envelope" aria-label="Open ${letter.tag.toLowerCase()}: ${letter.title}">
      <span class="env-back"></span>
      <span class="env-paper"><i></i><i></i><i></i><i></i><i></i><i></i></span>
      <span class="env-front"></span>
      <span class="env-flap"></span>
      ${envelopeFlap(i)}
      <span class="env-seal">${SEAL}</span>
      <span class="folder" aria-hidden="true">
        <span class="folder-tab"></span>
        <span class="folder-back"></span>
        <span class="folder-paper"></span>
        <span class="folder-front"><span class="folder-heart">${FOLDER_HEART}</span></span>
      </span>
    </button>`;
  const env = card.querySelector(".envelope");
  env.addEventListener("click", () => openLetter(i, env));
  mailbox.appendChild(card);
});

function openLetter(i, env) {
  if (currentMode() === "cute") { openPixelLetter(i, env); return; }
  if (!unlocked.has(i) && CONFIG.letters[i].unlock) {
    openSys({
      message: ["type ", { strong: CONFIG.letters[i].unlock }, " to open"],
      answer: CONFIG.letters[i].unlock,
      letterIndex: i,
      onOk: () => { unlocked.add(i); openLetter(i, env); },
    });
    return;
  }
  const letter = CONFIG.letters[i];
  env.classList.add("open");
  letterTag.textContent = letter.tag;
  letterTitle.textContent = letter.title;
  letterBody.replaceChildren();
  letter.paragraphs.forEach((p) => {
    const el = document.createElement("p");
    el.textContent = p.replace(/\{name\}/g, displayName || "you");
    letterBody.appendChild(el);
  });
  const sign = document.createElement("p");
  sign.className = "sign";
  sign.textContent = letter.signoff;
  const who = document.createElement("strong");
  who.textContent = letter.from || CONFIG.from;
  sign.appendChild(who);
  letterBody.appendChild(sign);

  setTimeout(() => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.querySelector(".paper").scrollTop = 0;
    const r = env.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 60);
  }, reduceMotion ? 0 : 750);
}

function closeLetter() {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}
document.getElementById("letterClose").addEventListener("click", closeLetter);

/* ---------- cute mode: unlock box + pixel letter ---------- */
const lockDialog = document.getElementById("lockDialog");
const lockWin = lockDialog.querySelector(".pixel-win");
const lockForm = document.getElementById("lockForm");
const lockInput = document.getElementById("lockInput");
const lockMsg = document.getElementById("lockMsg");
const pwLetter = document.getElementById("pwLetter");
const unlocked = new Set();
let activeLetter = 0;

const normalise = (t) => t.trim().toLowerCase().replace(/\s+/g, " ");

function showPixelDialog() {
  if (typeof lockDialog.showModal === "function") { if (!lockDialog.open) lockDialog.showModal(); }
  else lockDialog.setAttribute("open", "");
}

function openPixelLetter(i, env) {
  activeLetter = i;
  env.classList.add("open");
  document.getElementById("pwFile").textContent = fileNames[i] || "untitled";
  if (unlocked.has(i)) { renderPixelLetter(i); showPixelDialog(); return; }
  const phrase = CONFIG.letters[i].unlock || "";
  const title = document.getElementById("lockTitle");
  title.replaceChildren("type ");
  const em = document.createElement("em");
  em.textContent = phrase;
  title.append(em, " to unlock");
  lockMsg.textContent = "";
  lockInput.value = "";
  lockForm.hidden = false;
  pwLetter.hidden = true;
  lockDialog.classList.remove("reading");
  showPixelDialog();
  lockInput.focus();
}

function renderPixelLetter(i) {
  const letter = CONFIG.letters[i];
  document.getElementById("pwTag").textContent = letter.tag;
  document.getElementById("pwTitle").textContent = letter.title;
  const body = document.getElementById("pwBody");
  body.replaceChildren();
  letter.paragraphs.forEach((p) => {
    const el = document.createElement("p");
    el.textContent = p.replace(/\{name\}/g, displayName || "you");
    body.appendChild(el);
  });
  const sign = document.createElement("p");
  sign.className = "sign";
  sign.textContent = letter.signoff;
  const who = document.createElement("strong");
  who.textContent = letter.from || CONFIG.from;
  sign.appendChild(who);
  body.appendChild(sign);
  lockForm.hidden = true;
  pwLetter.hidden = false;
  pwLetter.scrollTop = 0;
  lockDialog.classList.add("reading");
}

lockForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const want = normalise(CONFIG.letters[activeLetter].unlock || "");
  const val = normalise(lockInput.value);
  const matches = val === want || (activeLetter === 1 && val === "i love open");
  if (matches) {
    unlocked.add(activeLetter);
    renderPixelLetter(activeLetter);
    const r = lockWin.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + 40, 90);
  } else {
    lockMsg.textContent = lockInput.value.trim() ? "not quite, try again" : "type the phrase first";
    lockWin.classList.remove("shake");
    void lockWin.offsetWidth;
    lockWin.classList.add("shake");
    lockInput.select();
  }
});

function closePixelDialog() {
  if (typeof lockDialog.close === "function") lockDialog.close();
  else lockDialog.removeAttribute("open");
}

document.getElementById("lockX").addEventListener("click", closePixelDialog);
lockDialog.addEventListener("click", (e) => { if (e.target === lockDialog) closePixelDialog(); });
lockDialog.addEventListener("close", () => {
  // Hand focus back to the folder that was opened, ready for the next one.
  const env = document.querySelectorAll(".envelope")[activeLetter];
  if (env) env.focus({ preventScroll: true });
});

document.getElementById("backTop").addEventListener("click", () => {
  document.getElementById("celebrate").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
});

/* ---------- pretty mode: "System message" pop-up ---------- */
const sysDialog = document.getElementById("sysDialog");
const sysForm = document.getElementById("sysForm");
const sysMsg = document.getElementById("sysMsg");
const sysInput = document.getElementById("sysInput");
const sysErr = document.getElementById("sysErr");
let sysOpts = null;

// message: array of strings and {strong: "..."} parts.
function openSys(opts) {
  sysOpts = opts;
  sysMsg.replaceChildren(...opts.message.map((part) => {
    if (typeof part === "string") return part;
    const b = document.createElement("strong");
    b.textContent = part.strong;
    return b;
  }));
  sysErr.textContent = "";
  sysInput.value = "";
  sysInput.hidden = !opts.answer;
  if (typeof sysDialog.showModal === "function") { if (!sysDialog.open) sysDialog.showModal(); }
  else sysDialog.setAttribute("open", "");
  (opts.answer ? sysInput : document.getElementById("sysOk")).focus();
}

function closeSys() {
  if (typeof sysDialog.close === "function") sysDialog.close();
  else sysDialog.removeAttribute("open");
}

sysForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const opts = sysOpts;
  if (!opts) return;
  if (opts.answer) {
    const val = normalise(sysInput.value);
    const want = normalise(opts.answer);
    const matches = val === want || (opts.letterIndex === 1 && val === "i love open");
    if (!matches) {
      sysErr.textContent = sysInput.value.trim() ? "not quite, try again" : "type the phrase first";
      sysForm.classList.remove("shake");
      void sysForm.offsetWidth;
      sysForm.classList.add("shake");
      sysInput.select();
      return;
    }
  }
  sysOpts = null;
  closeSys();
  if (opts.onOk) opts.onOk();
});

document.getElementById("sysX").addEventListener("click", () => { sysOpts = null; closeSys(); });