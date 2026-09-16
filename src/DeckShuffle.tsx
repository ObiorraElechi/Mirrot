import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import "./DeckShuffle.css";

type Props = {
  enabled: boolean;
  back: string;
  count?: number;
  speed?: number;
  staticWhenDisabled?: boolean;
};

const FLING_MS = 1000;  // must match CSS animation duration
const DROP_AT = 0.55;   // when the flying card should drop behind (optional)

const CARD_COLS = 100;
const CARD_ROWS = 83;
// Per-card fan offsets, matching the --x / --y poses below.
const FAN_STEP_X = 10;
const FAN_STEP_Y = 6;
// The hint line under the deck plus the deck's own bottom margin.
const BELOW = 88;
const SIDE_GUTTER = 12;
const MIN_FONT = 2.6;
const MAX_FONT = 8;

/**
 * The browser rounds a monospace glyph's advance to a whole pixel, so 100
 * columns only ever renders at an exact multiple of 100px. Sizing the box in
 * `em` or `ch` therefore disagrees with the text inside it — `ch` is rounded
 * too, and swung between 0.53em and 0.70em across the sizes used here.
 */
const advancePx = (fontPx: number) => Math.max(1, Math.round(0.625 * fontPx));

/** Largest font that still renders at `cols` px per column. */
const fontForAdvance = (cols: number) => (cols + 0.5) / 0.625 - 0.002;

export default function DeckShuffle({
  enabled,
  back,
  count = 9,
  speed = 140,
  staticWhenDisabled = true,
}: Props) {
    const ids = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

    const [order, setOrder] = useState<number[]>(ids);
    const [flyingId, setFlyingId] = useState<number | null>(null);
    const [sentToBack, setSentToBack] = useState(false);

    const timerRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const deckRef = useRef<HTMLDivElement | null>(null);

    const fanX = (count - 1) * FAN_STEP_X;
    const fanY = (count - 1) * FAN_STEP_Y;

    /**
     * A card is 83 rows tall but only 60em wide, so viewport width alone is the
     * wrong thing to size it from — on a phone it runs out of height first.
     * The fixed chrome above the deck also varies (the title ASCII has its own
     * clamp), so rather than hard-code a reserve per breakpoint, measure where
     * the deck actually starts and fit it into what is genuinely left.
     *
     * The deck sits at the top of a flex-start column, so its own height does
     * not move its top edge and this settles in one pass.
     */
    const [fontPx, setFontPx] = useState(MIN_FONT);

    useLayoutEffect(() => {
      const el = deckRef.current;
      if (!el) return;

      const fit = () => {
        const vv = window.visualViewport;
        const vw = vv?.width ?? window.innerWidth;
        const vh = vv?.height ?? window.innerHeight;
        const top = el.getBoundingClientRect().top;

        const availW = vw - SIDE_GUTTER - fanX;
        const availH = vh - top - BELOW - fanY;

        // Width is a step function, so pick the widest step that fits and then
        // the largest font that still lands on it — otherwise a font chosen by
        // height alone can round up a column and overflow.
        const cols = Math.max(1, Math.floor(availW / CARD_COLS));
        const next = Math.min(fontForAdvance(cols), availH / CARD_ROWS);
        const clamped = Math.max(MIN_FONT, Math.min(MAX_FONT, next));

        // Guard against a measure/resize feedback loop on sub-pixel churn.
        setFontPx((prev) => (Math.abs(prev - clamped) > 0.05 ? clamped : prev));
      };

      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(document.documentElement);
      window.visualViewport?.addEventListener("resize", fit);
      window.addEventListener("orientationchange", fit);
      return () => {
        observer.disconnect();
        window.visualViewport?.removeEventListener("resize", fit);
        window.removeEventListener("orientationchange", fit);
      };
    }, [fanX, fanY]);

    const orderRef = useRef(order);
    useEffect(() => {
    orderRef.current = order;
    }, [order]);

    // compute back-slot pose based on count
    const last = count - 1;
    const bx = last * 10;
    const by = last * 6;
    const br = last * 0.5;
    const bs = 1 - last * 0.01;

    const startFling = () => {
    if (flyingId !== null) return;

    setOrder(prev => {
        if (prev.length <= 1) return prev;
        const [top, ...rest] = prev;

        setFlyingId(top);      // animate this as overlay
        setSentToBack(false);  // reset

        return [...rest, top];
    });
    };

    useEffect(() => {
    if (!enabled) return;

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
        startFling();
    }, speed);

    return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, speed, flyingId]); // flyingId here stops interval spam if desired

    // optional: drop the overlay behind the deck mid-flight (prevents “always on top” feel)
    useEffect(() => {
    if (flyingId === null) return;

    timerRef.current = window.setTimeout(() => {
        setSentToBack(true);
    }, Math.floor(FLING_MS * DROP_AT));

    return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = null;
    };
    }, [flyingId]);

    // reset when disabled or count changes
    useEffect(() => {
        if (!enabled) {
            setFlyingId(null);
            setSentToBack(false);
            if (!staticWhenDisabled) {
            setOrder(ids);
            }
        }
    }, [enabled, ids, staticWhenDisabled]);


    // stack should'nt be rendering the flying card
    const stack = flyingId === null ? order : order.filter(id => id !== flyingId);

    const handleOverlayEnd = () => {
    setFlyingId(null);
    setSentToBack(false);
    };

    const pose = (extra: CSSProperties): CSSProperties => extra;

    return (
    <div
        className="deck"
        aria-hidden="true"
        ref={deckRef}
        style={{
          ["--shuffle-font" as string]: `${fontPx.toFixed(3)}px`,
          ["--card-w" as string]: `${CARD_COLS * advancePx(fontPx)}px`,
          ["--fan-x" as string]: `${fanX}px`,
          ["--fan-y" as string]: `${fanY}px`,
        }}
    >
        {stack.map((cardId, i) => {
        const x = i * 10;
        const y = i * 6;
        const r = i * 0.5;
        const s = 1 - i * 0.01;

        return (
            <div
            key={cardId}
            className="cardBack"
            style={pose({
                ["--x" as string]: `${x}px`,
                ["--y" as string]: `${y}px`,
                ["--r" as string]: `${r}deg`,
                ["--s" as string]: String(s),
                zIndex: 100 - i,
            })}
            >
            <pre className="ascii cardAscii shuffleFace">{back}</pre>
            </div>
        );
        })}

        {/* overlay flying card animates separately from stack... */}
        {flyingId !== null && (
        <div
            className={`cardBack flingOverlay ${sentToBack ? "sentBack" : ""}`}
            style={pose({
            ["--x" as string]: `0px`,
            ["--y" as string]: `0px`,
            ["--r" as string]: `0deg`,
            ["--s" as string]: "1",
            ["--bx" as string]: `${bx}px`,
            ["--by" as string]: `${by}px`,
            ["--br" as string]: `${br}deg`,
            ["--bs" as string]: String(bs),
            zIndex: sentToBack ? -1 : 9999,
            })}
            onAnimationEnd={handleOverlayEnd}
        >
            <pre className="ascii cardAscii shuffleFace">{back}</pre>
        </div>
        )}
    </div>
    );
}
