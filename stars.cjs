const fs = require("fs");
const path = require("path");

const OUT_DIR = "tarot-terminal/public/Stars-Ascii/";

const W = 240;
const H = 65;
const FRAMES = 60;

// star palette (keep it subtle)
const DIM = ".";
const MID = "*";
const BRIGHT = "+";
const FLARE = "✦"; // looks great in many monospace fonts; swap to "#" if it renders weird

// density + flicker controls
const STAR_PROB = 0.035;        // overall density
const FLICKER_PROB = 0.03;      // chance a star changes brightness in a given frame

// flare controls
const FLARES_PER_MINUTE = 2;    // across 60 frames (you can tune this)
const FLARE_LEN = 6;            // frames flare lasts
// flare intensity timeline (len must match FLARE_LEN)
const FLARE_TIMELINE = [BRIGHT, FLARE, FLARE, BRIGHT, MID, DIM];

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function makeBaseSky() {
  const grid = Array.from({ length: H }, () => Array.from({ length: W }, () => " "));

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (Math.random() < STAR_PROB) {
        // bias toward dim stars
        const roll = Math.random();
        grid[r][c] = roll < 0.72 ? DIM : roll < 0.93 ? MID : BRIGHT;
      }
    }
  }
  return grid;
}

function forceDifferentStarChar(current) {
  // assumes current is one of ".", "*", "+"
  const options = [DIM, MID, BRIGHT].filter(ch => ch !== current);
  return options[randInt(options.length)];
}

function flickerChar(c) {
  if (c === " ") return " ";
  // Keep flicker constrained to normal star chars
  if (c !== DIM && c !== MID && c !== BRIGHT) return c;

  if (Math.random() >= FLICKER_PROB) return c;

  const roll = Math.random();
  return roll < 0.72 ? DIM : roll < 0.93 ? MID : BRIGHT;
}

function pickStarPositions(base, k) {
  const stars = [];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (base[r][c] !== " ") stars.push([r, c]);
    }
  }
  if (stars.length === 0) throw new Error("No stars generated; increase STAR_PROB.");

  // pick k unique positions
  const picks = [];
  const used = new Set();
  while (picks.length < k && used.size < stars.length) {
    const idx = randInt(stars.length);
    const key = idx.toString();
    if (used.has(key)) continue;
    used.add(key);
    picks.push(stars[idx]);
  }
  return picks;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(OUT_DIR);

  const base = makeBaseSky();

  const starPositions = [];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (base[r][c] !== " ") starPositions.push([r, c]);
    }
  }
  if (starPositions.length === 0) throw new Error("No stars generated; increase STAR_PROB.");

  // For each star, choose ONE frame where it must change
  const mustChangeAt = new Map(); // key "r,c" -> frameIndex
  for (const [r, c] of starPositions) {
    const frameIdx = randInt(FRAMES);
    mustChangeAt.set(`${r},${c}`, frameIdx);
  }

  // number of flare events across FRAMES
  const flareEvents = Math.max(1, Math.round((FRAMES / 60) * FLARES_PER_MINUTE));

  // choose star positions for flares
  const flarePositions = pickStarPositions(base, flareEvents);

  // choose start frames for each flare (avoid overlap)
  const starts = [];
  const taken = new Set();
  for (let i = 0; i < flareEvents; i++) {
    let start;
    let tries = 0;
    do {
      start = randInt(Math.max(1, FRAMES - FLARE_LEN));
      tries++;
      // keep some spacing between flares
    } while ((taken.has(start) || starts.some(s => Math.abs(s - start) < FLARE_LEN + 4)) && tries < 200);

    starts.push(start);
    taken.add(start);
  }

  // build a lookup: frame -> list of flare overlays
  const flareByFrame = new Map(); // frameIndex -> [{r,c,char}]
  for (let i = 0; i < flareEvents; i++) {
    const [r, c] = flarePositions[i];
    const start = starts[i];

    for (let t = 0; t < FLARE_LEN; t++) {
      const frameIdx = start + t;
      const ch = FLARE_TIMELINE[t];
      if (!flareByFrame.has(frameIdx)) flareByFrame.set(frameIdx, []);
      flareByFrame.get(frameIdx).push({ r, c, ch });
    }
  }

    // generate frames
  for (let f = 0; f < FRAMES; f++) {
    // start from base
    const frame = base.map(row => row.slice());

    // apply guaranteed change (every star changes at least once)
    for (const [r, c] of starPositions) {
      const key = `${r},${c}`;
      if (mustChangeAt.get(key) === f) {
        frame[r][c] = forceDifferentStarChar(frame[r][c]);
      } else {
        // optional: keep gentle extra flicker for natural feel
        frame[r][c] = flickerChar(frame[r][c]);
      }
    }

    // apply flare overlay (if you kept flares)
    const overlays = flareByFrame?.get?.(f);
    if (overlays) {
      for (const { r, c, ch } of overlays) frame[r][c] = ch;
    }

    const text = frame.map(r => r.join("")).join("\n");
    const filename = path.join(OUT_DIR, `${String(f).padStart(2, "0")}.txt`);
    fs.writeFileSync(filename, text, "utf8");
  }

  console.log(`Generated ${FRAMES} frames in ${OUT_DIR}`);
  console.log(`Flares: ${flareEvents} events, duration ${FLARE_LEN} frames each`);
}

main();
