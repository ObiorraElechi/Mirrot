import { useEffect, useMemo, useRef, useState } from "react";
import "./DeckShuffle.css";

type Props = { enabled: boolean; count?: number; speed?: number; staticWhenDisabled?: boolean };

const FLING_MS = 1000;  // must match CSS animation duration
const DROP_AT = 0.55;   // when the flying card should drop behind (optional)

export default function DeckShuffle({ enabled, count = 9, speed = 140, staticWhenDisabled= true }: Props) {
    const ids = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

    const [order, setOrder] = useState<number[]>(ids);
    const [flyingId, setFlyingId] = useState<number | null>(null);
    const [sentToBack, setSentToBack] = useState(false);

    const timerRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);

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

    return (
    <div className="deck" aria-hidden="true">
        {stack.map((cardId, i) => {
        const x = i * 10;
        const y = i * 6;
        const r = i * 0.5;
        const s = 1 - i * 0.01;

        return (
            <div
            key={cardId}
            className="cardBack"
            style={{
                ["--x" as any]: `${x}px`,
                ["--y" as any]: `${y}px`,
                ["--r" as any]: `${r}deg`,
                ["--s" as any]: s,
                zIndex: 100 - i,
            }}
            >
            <img className="cardImg" src="./tarotBack.png" alt="" draggable={false} />
            </div>
        );
        })}

        {/* overlay flying card animates separately from stack... */}
        {flyingId !== null && (
        <div
            className={`cardBack flingOverlay ${sentToBack ? "sentBack" : ""}`}
            style={{
            // start pose = top slot (0)
            ["--x" as any]: `0px`,
            ["--y" as any]: `0px`,
            ["--r" as any]: `0deg`,
            ["--s" as any]: 1,

            // end pose = back slot
            ["--bx" as any]: `${bx}px`,
            ["--by" as any]: `${by}px`,
            ["--br" as any]: `${br}deg`,
            ["--bs" as any]: bs,

            // stay on top, then optionally drop behind
            zIndex: sentToBack ? -1 : 9999,
            }}
            onAnimationEnd={handleOverlayEnd}
        >
            <img className="cardImg" src="./tarotBack.png" alt="" draggable={false} />
        </div>
        )}
    </div>
    );
}
