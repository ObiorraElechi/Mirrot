import { useEffect, useState } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type Props = {
  enabled: boolean;
  fps?: number;
  frameCount?: number;
};

export default function AsciiBackground({ enabled, fps = 12, frameCount = 60 }: Props) {
  const [frames, setFrames] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

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
    <pre className="stars-ascii" aria-hidden="true">
      {frames.length ? frames[idx] : ""}
    </pre>
  );
}
