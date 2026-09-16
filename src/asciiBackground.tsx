import { useEffect, useState } from "react";
import { useViewport } from "./useViewport";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// The star frames are a fixed character grid, so their natural size follows
// from the font metrics declared for pre.stars-ascii in App.css.
const STARS_COLS = 240;
const STARS_ROWS = 64;
const STARS_FONT_PX = 16;
const STARS_LINE_PX = 10;
const STARS_NATURAL_W = STARS_COLS * STARS_FONT_PX * 0.5;
const STARS_NATURAL_H = STARS_ROWS * STARS_LINE_PX;

type Props = {
  enabled: boolean;
  fps?: number;
  frameCount?: number;
};

export default function AsciiBackground({ enabled, fps = 12, frameCount = 60 }: Props) {
  const [frames, setFrames] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const viewport = useViewport();

  // Cover the viewport rather than assuming a desktop aspect ratio.
  const coverScale = Math.max(
    viewport.width / STARS_NATURAL_W,
    viewport.height / STARS_NATURAL_H,
  );

  // preload all frames once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const urls = Array.from({ length: frameCount }, (_, i) => `/Stars-Ascii/${pad2(i)}.txt`);
      const texts = await Promise.all(urls.map(u => fetch(u).then(r => r.text())));
      if (!cancelled) setFrames(texts);
    })().catch(console.error);

    return () => { cancelled = true; };
  }, [frameCount]);

  // animate by cycling the preloaded strings
  useEffect(() => {
    if (!enabled) return;
    if (frames.length === 0) return;

    const intervalMs = Math.max(16, Math.floor(1000 / fps));
    const id = window.setInterval(() => {
      setIdx(i => (i + 1) % frames.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [enabled, fps, frames.length]);

  return (
    <pre
      className="stars-ascii"
      aria-hidden="true"
      style={{ transform: `scale(${coverScale.toFixed(3)})` }}
    >
      {frames.length ? frames[idx] : ""}
    </pre>
  );
}
