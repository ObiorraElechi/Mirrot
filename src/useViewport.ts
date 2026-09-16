import { useEffect, useState } from "react";

export type Viewport = { width: number; height: number };

function readViewport(): Viewport {
  // visualViewport tracks iOS Safari's collapsing URL bar; innerWidth/Height do not.
  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
  };
}

/** Viewport size that actually updates on resize, rotation and URL-bar collapse. */
export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(readViewport);

  useEffect(() => {
    let raf = 0;
    const onChange = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => setViewport(readViewport()));
    };

    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    window.visualViewport?.addEventListener("resize", onChange);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
      window.visualViewport?.removeEventListener("resize", onChange);
    };
  }, []);

  return viewport;
}
