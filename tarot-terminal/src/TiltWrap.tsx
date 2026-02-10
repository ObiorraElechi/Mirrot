import { useEffect, useRef } from "react";

export function TiltWrap({ i, enabled, children }: { i: number; enabled: boolean; children: React.ReactNode; }) {
  
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const AMP_X = 5;
  const AMP_Y = 5;
  const PERIOD_MS = 9000 + i * 500;
  
  useEffect(() => {
    
    const elem = tiltRef.current;

    if (!elem) return;

    if (!enabled) {
      elem.style.transform = "rotateX(0deg) rotateY(0deg)";
      return;
    }

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    // per-card phase offsets so oscillation ffeels more natural!!
    const phiX = i * 1.7;          // spacing
    const phiY = i * 1.3 + 0.9;   // 

    const w = (2 * Math.PI) / PERIOD_MS;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const dt = t - t0;
      const x = AMP_X * Math.sin(w * dt + phiX);
      const y = AMP_Y * Math.cos(w * dt + phiY);

      elem.style.transform = `rotateX(${x.toFixed(3)}deg) rotateY(${y.toFixed(3)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, enabled]);

  return (
    <div className="tiltOuter">
      <div className="cardHover">
        <div ref={tiltRef} className="tiltRotation" style = {{ transformStyle: "preserve-3d", transformOrigin: "center center" }}>
          {children}
        </div>
      </div>
    </div>
  );
}