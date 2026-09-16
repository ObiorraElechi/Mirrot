import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { BoardGestureContext, type GestureState } from "./boardGesture";

type Transform = { scale: number; x: number; y: number };
type Point = { x: number; y: number };

const TAP_SLOP_PX = 10;
const MAX_ZOOM_FACTOR = 4;
const FOCUS_MS = 520;

export type BoardFocusOpts = {
  /** Pixels of the host covered by the meaning sheet, so the card sits in the remaining gap. */
  bottomInset?: number;
  /** Canvas-local size to fit on screen (usually one card). */
  fitWidth?: number;
  fitHeight?: number;
};

export type BoardHandle = {
  focusCanvasPoint: (x: number, y: number, opts?: BoardFocusOpts) => void;
  resetView: () => void;
};

type Props = {
  boardWidth: number;
  boardHeight: number;
  children: ReactNode;
};

/**
 * Renders a fixed-size logical canvas scaled to fit the space available.
 * When the canvas cannot fit at its design size the board becomes pannable
 * and pinch-zoomable instead of being shrunk into illegibility.
 */
export const BoardViewport = forwardRef<BoardHandle, Props>(function BoardViewport(
  { boardWidth, boardHeight, children },
  ref,
) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState<{ w: number; h: number } | null>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const [animating, setAnimating] = useState(false);

  const panned = useRef(false);
  const gestureValue = useMemo<GestureState>(() => ({ panned }), []);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    anchor: Point;
    startScale: number;
    startSpread: number;
    startCentre: Point;
  } | null>(null);

  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new ResizeObserver((entries) => {
      const box = entries[0].contentRect;
      setAvail({ w: Math.round(box.width), h: Math.round(box.height) });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const fitScale =
    avail && avail.w > 0 && avail.h > 0
      ? Math.min(avail.w / boardWidth, avail.h / boardHeight)
      : null;

  // Never enlarge beyond the design size, so desktop keeps the layout it was tuned for.
  const baseScale = fitScale === null ? null : Math.min(1, fitScale);
  const zoomedIn = baseScale !== null && transform.scale > baseScale + 0.02;
  const canExplore = baseScale !== null && (baseScale < 1 || zoomedIn);

  const [prevBaseScale, setPrevBaseScale] = useState(baseScale);
  if (baseScale !== null && baseScale !== prevBaseScale) {
    setPrevBaseScale(baseScale);
    setTransform({ scale: baseScale, x: 0, y: 0 });
  }

  const clampScale = useCallback(
    (scale: number) => {
      if (baseScale === null) return scale;
      const max = Math.max(2, baseScale * MAX_ZOOM_FACTOR);
      return Math.min(Math.max(baseScale, scale), max);
    },
    [baseScale],
  );

  const clamp = useCallback(
    (next: Transform): Transform => {
      if (!avail) return next;
      const overflowX = Math.max(0, (boardWidth * next.scale - avail.w) / 2);
      const overflowY = Math.max(0, (boardHeight * next.scale - avail.h) / 2);
      return {
        scale: next.scale,
        x: Math.min(overflowX, Math.max(-overflowX, next.x)),
        y: Math.min(overflowY, Math.max(-overflowY, next.y)),
      };
    },
    [avail, boardWidth, boardHeight],
  );

  const pointerCentre = useCallback((): Point => {
    const list = [...pointers.current.values()];
    const total = list.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: total.x / list.length, y: total.y / list.length };
  }, []);

  const pointerSpread = useCallback((): number => {
    const list = [...pointers.current.values()];
    if (list.length < 2) return 0;
    return Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
  }, []);

  const hostCentre = useCallback((): Point | null => {
    const host = hostRef.current;
    if (!host) return null;
    const box = host.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      focusCanvasPoint(px, py, opts = {}) {
        if (baseScale === null || !avail || !hostRef.current) return;
        const bottomInset = opts.bottomInset ?? 0;
        const box = hostRef.current.getBoundingClientRect();
        const origin = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        const visibleH = Math.max(120, avail.h - bottomInset);
        const target = {
          x: origin.x,
          y: box.top + visibleH / 2,
        };
        const world = { x: px - boardWidth / 2, y: py - boardHeight / 2 };

        let scale = transformRef.current.scale;
        if (opts.fitWidth && opts.fitHeight) {
          scale = Math.min(avail.w / (opts.fitWidth * 1.28), visibleH / (opts.fitHeight * 1.18));
        }
        scale = clampScale(scale);

        setAnimating(true);
        setTransform(
          clamp({
            scale,
            x: target.x - origin.x - world.x * scale,
            y: target.y - origin.y - world.y * scale,
          }),
        );
      },
      resetView() {
        if (baseScale === null) return;
        setAnimating(true);
        setTransform({ scale: baseScale, x: 0, y: 0 });
      },
    }),
    [avail, baseScale, boardWidth, boardHeight, clamp, clampScale],
  );

  useEffect(() => {
    if (!animating) return;
    const id = window.setTimeout(() => setAnimating(false), FOCUS_MS);
    return () => window.clearTimeout(id);
  }, [animating, transform]);

  /**
   * Records which board-local point sits under the gesture centre. Keeping that
   * point pinned makes one formula serve both panning and pinching.
   */
  const beginGesture = useCallback(() => {
    const origin = hostCentre();
    if (!origin || pointers.current.size === 0) {
      gesture.current = null;
      return;
    }

    const centre = pointerCentre();
    const current = transformRef.current;
    gesture.current = {
      anchor: {
        x: (centre.x - origin.x - current.x) / current.scale,
        y: (centre.y - origin.y - current.y) / current.scale,
      },
      startScale: current.scale,
      startSpread: pointerSpread(),
      startCentre: centre,
    };
  }, [hostCentre, pointerCentre, pointerSpread]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canExplore) return;
    setAnimating(false);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) panned.current = false;
    beginGesture();
  };

  useEffect(() => {
    if (!canExplore) return;

    const onMove = (event: PointerEvent) => {
      if (!pointers.current.has(event.pointerId)) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      const active = gesture.current;
      const origin = hostCentre();
      if (!active || !origin) return;

      const centre = pointerCentre();
      const spread = pointerSpread();

      if (pointers.current.size > 1) {
        panned.current = true;
      } else if (Math.hypot(centre.x - active.startCentre.x, centre.y - active.startCentre.y) > TAP_SLOP_PX) {
        panned.current = true;
      }

      // Hold still until the movement is clearly a drag, so taps stay stable.
      if (!panned.current) return;

      const ratio = active.startSpread > 0 && spread > 0 ? spread / active.startSpread : 1;
      const scale = clampScale(active.startScale * ratio);

      setTransform(
        clamp({
          scale,
          x: centre.x - origin.x - active.anchor.x * scale,
          y: centre.y - origin.y - active.anchor.y * scale,
        }),
      );
    };

    const onRelease = (event: PointerEvent) => {
      if (!pointers.current.delete(event.pointerId)) return;
      if (pointers.current.size === 0) {
        gesture.current = null;
      } else {
        // Re-anchor so lifting one finger mid-pinch does not jump the board.
        beginGesture();
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onRelease);
    window.addEventListener("pointercancel", onRelease);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
    };
  }, [canExplore, beginGesture, clamp, clampScale, hostCentre, pointerCentre, pointerSpread]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || baseScale === null) return;

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      const origin = hostCentre();
      if (!origin) return;

      event.preventDefault();
      setAnimating(false);
      const current = transformRef.current;
      const scale = clampScale(current.scale * Math.exp(-event.deltaY / 200));
      const anchor = {
        x: (event.clientX - origin.x - current.x) / current.scale,
        y: (event.clientY - origin.y - current.y) / current.scale,
      };

      setTransform(
        clamp({
          scale,
          x: event.clientX - origin.x - anchor.x * scale,
          y: event.clientY - origin.y - anchor.y * scale,
        }),
      );
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel);
  }, [baseScale, clamp, clampScale, hostCentre]);

  return (
    <div
      ref={hostRef}
      className={`boardViewport ${canExplore ? "isExplorable" : ""}`}
      onPointerDown={onPointerDown}
    >
      <div
        className={`boardWorld${animating ? " isAnimating" : ""}`}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          visibility: avail ? "visible" : "hidden",
        }}
      >
        <div
          className="boardCanvas"
          style={{
            width: `${boardWidth}px`,
            height: `${boardHeight}px`,
          }}
        >
          <BoardGestureContext.Provider value={gestureValue}>{children}</BoardGestureContext.Provider>
        </div>
      </div>

      {baseScale !== null && baseScale < 1 && !zoomedIn && (
        <p className="boardHint">Drag to pan · pinch to zoom</p>
      )}
    </div>
  );
});
