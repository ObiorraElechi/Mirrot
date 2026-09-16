import { useEffect, useRef, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import './App.css';
import AsciiBackground from "./asciiBackground";
import DeckShuffle from "./DeckShuffle";
import { EntropyCollectorRitual, mulberry32 } from "./userEntropy";
import { drawCard, parseCard } from "./deck";
import type { CardPath } from "./deck";
import { MEANINGS_BY_PATH } from "./tarotMeanings";
import { TiltWrap } from "./TiltWrap"
import { BoardViewport, type BoardHandle } from "./BoardViewport";
import { useBoardGesture } from "./boardGesture";
import {
  boardMetrics,
  cardPixelSize,
  getCardCount,
  getLabelsFor,
  slotCanvasPoint,
} from "./spreadLayout";
import type { Label, SpreadType } from "./spreadLayout";

const TAP_SLOP_PX = 10;

function suitClassFor(path: CardPath) {
  switch (parseCard(path).suit) {
    case "MajorArcana": return "suit-major";
    case "Cups":        return "suit-cups";
    case "Pentacles":   return "suit-pentacles";
    case "Swords":      return "suit-swords";
    case "Wands":       return "suit-wands";
    default:            return "";
  }
}

function FlipCard({ back, face, reversed, disabled, onRevealed, }: { back: string; face: string; reversed: boolean; disabled?: boolean; onRevealed?: () => void;}) {
  const [flipped, setFlipped] = useState(false);
  const gesture = useBoardGesture();
  const pressRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      className={`flipCard ${flipped ? "isFlipped" : ""} ${disabled ? "disabled" : ""}`}
      onPointerDown={(e) => {
        if (disabled || flipped) return;
        pressRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const press = pressRef.current;
        pressRef.current = null;

        if (!press || disabled || flipped) return;
        // A drag across the board is a pan, not a card tap.
        if (gesture?.panned.current) return;
        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_SLOP_PX) return;

        setFlipped(true);
        onRevealed?.();
      }}
      onPointerCancel={() => { pressRef.current = null; }}
      onContextMenu={(e) => e.preventDefault()}
      role="button"
      aria-disabled={disabled}
      tabIndex={0}
    >
      <div className="flipInner">
        <pre className="ascii cardAscii flipSide flipBack">{back}</pre>
        <pre className={`ascii cardAscii flipSide flipFront ${reversed ? "rev" : ""}`}>{face}</pre>
      </div>
    </div>
  );
}

/** Hover popover used on precise pointers; lives inside the scaled board. */
function CardHitArea({
  revealed,
  onToggle,
  children,
}: {
  revealed: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const gesture = useBoardGesture();

  return (
    <div
      className="cardHitArea"
      onPointerUp={() => {
        if (!revealed) return;
        if (gesture?.panned.current) return;
        onToggle();
      }}
    >
      {children}
    </div>
  );
}

function MeaningSheet({
  card,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  card: DrawnCard;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const meaning = MEANINGS_BY_PATH[card.path];
  const line = card.reversed ? meaning.reversed : meaning.upright;
  const suitClass = card.revealed ? suitClassFor(card.path) : "";
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  return (
    <div className={`meaningSheet ${suitClass}`} role="dialog" aria-label={`${card.label} meaning`}>
      <div className="meaningSheetBar">
        <span className={`meaningTitle ${suitClass}`}>
          {card.revealed
            ? `${card.name}${card.reversed ? " (reversed)" : ""}`
            : "Unrevealed"}
        </span>
        <button type="button" className="meaningSheetClose" onClick={onClose} aria-label="Close meaning">
          x
        </button>
      </div>
      <p className="meaningSheetSlot">{card.label}</p>
      <p className="meaningSheetBody">
        {card.revealed ? line : "Turn this card to continue the reading."}
      </p>
      <div className="meaningSheetNav">
        {hasPrev ? (
          <button type="button" className="meaningSheetArrow meaningSheetArrowPrev" onClick={onPrev} aria-label="Previous card">
            {"<--"}
          </button>
        ) : (
          <span className="meaningSheetArrowSpacer" aria-hidden="true" />
        )}
        <span className="meaningSheetProgress">{index + 1} / {total}</span>
        {hasNext ? (
          <button type="button" className="meaningSheetArrow meaningSheetArrowNext" onClick={onNext} aria-label="Next card">
            {"-->"}
          </button>
        ) : (
          <span className="meaningSheetArrowSpacer" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

const REQUIRED_KEYS = ["a", "s", "d", "f", " ", "j", "k", "l", ";"];
const RITUAL_KEYS = new Set<string>(REQUIRED_KEYS);

const MIRROT_TITLE = String.raw`                                                
     *****   **    **                                                   
  ******  ***** *****    *                                        *     
 **   *  *  ***** ***** ***                                      **     
*    *  *   * **  * **   *                                       **     
    *  *    *     *         ***  ****   ***  ****     ****     ******** 
   ** **    *     *    ***   **** **** * **** **** * * ***  * ********  
   ** **    *     *     ***   **   ****   **   **** *   ****     **     
   ** **    *     *      **   **          **       **    **      **     
   ** **    *     *      **   **          **       **    **      **     
   ** **    *     **     **   **          **       **    **      **     
   *  **    *     **     **   **          **       **    **      **     
      *     *      **    **   **          **       **    **      **     
  ****      *      **    **   ***         ***       ******       **     
 *  *****           **   *** * ***         ***       ****         **    
*     **                  ***                                           
*                                                                       
 **                                                                     
 `

type Phase = | "ritual" | "shuffling" | "cardsDown" | "revealed";

type DrawnCard = {
    label: Label; 
    path: CardPath;
    text: string;
    name: string;
    reversed: boolean;
    revealed: boolean;
};

  
export default function App() {
    
  // toggle Options:
  type RitualMode = "click" | "keys";    

  const [ritualMode, setRitualMode] = useState<RitualMode>(() => {
    const saved = localStorage.getItem("mirrot:ritualMode");
    return saved === "keys" ? "keys" : "click";
  });

  const [spread, setSpread] = useState<SpreadType>(() => {
    const saved = localStorage.getItem("mirrot:spreadType");
    return saved === "ppf" || saved === "cc" ? saved : "ppf";
  });
  
  const collector = useMemo(() => new EntropyCollectorRitual(), []);
  const [phase, setPhase] = useState<Phase>("ritual");

  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [cardBack, setCardBack] = useState<string>("LOADING BACK...");

  const [revealedCount, setRevealedCount] = useState(0);
  const [flipLock, setFlipLock] = useState(false); 
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const boardRef = useRef<BoardHandle | null>(null);
  const deckPressRef = useRef<HTMLDivElement | null>(null);
  
  const SHUFFLE_AFTER_RELEASE_MS = 0;
  const [pressing, setPressing] = useState(false);
  const pressStartRef = useRef<number | null>(null);
  const clickSeedRef = useRef<number | null>(null);
  const dealTimerRef = useRef<number | null>(null);

  const metrics = useMemo(() => boardMetrics(spread), [spread]);

  
  useEffect(() => {
    return () => {
      if (dealTimerRef.current) window.clearTimeout(dealTimerRef.current);
    };
  }, []);

  // on press, begins the shuffle animation and transitions the phase to shuffling
  const beginClickRitual = () => {
    if (phase !== "ritual") return;
    if (ritualMode !== "click") return;

    setPressing(true);
    pressStartRef.current = performance.now();
  };

  // upon release, draw cards based on user entropy and spread type
  const endClickRitual = () => {
    if (phase !== "ritual") return;
    if (ritualMode !== "click") return;
    if (!pressing) return;

    setPressing(false);

    const start = pressStartRef.current ?? performance.now();
    const holdMs = performance.now() - start;
    clickSeedRef.current = ((Math.floor(holdMs * 1000) ^ Date.now()) >>> 0);

    setPhase("shuffling");

    if (dealTimerRef.current) window.clearTimeout(dealTimerRef.current);
    dealTimerRef.current = window.setTimeout(() => {
      const seed = clickSeedRef.current ?? Date.now();
      const rand = mulberry32(seed);
      const labels = getLabelsFor(spread);
      const paths = drawCard(labels.length, rand);

      Promise.all(paths.map(async (p, i) => {
        const meta = parseCard(p);
        const text = await fetch(p).then(r => r.text());
        const reversed = rand() < 0.35;
        const displayName = meta.suit === "MajorArcana" ? meta.name : `${meta.name} of ${meta.suit}`;
        return { label: labels[i], path: p, text, name: displayName, reversed, revealed: false };
      })).then(cards => {
        setDrawn(cards);
        setRevealedCount(0);
        setFlipLock(false);
        setOpenIndex(null);
        setPhase("cardsDown");
      });
    }, SHUFFLE_AFTER_RELEASE_MS);
  };

  const cancelClickRitual = () => {
    setPressing(false);
    if (dealTimerRef.current) window.clearTimeout(dealTimerRef.current);
  };

  useEffect(() => {
    localStorage.setItem("mirrot:ritualMode", ritualMode);
  }, [ritualMode]);

  useEffect(() => {
    localStorage.setItem("mirrot:spreadType", spread);
  }, [spread]);

  useEffect(() => {
    fetch("./Tarot-Ascii/cardBack.txt").then(r => r.text()).then(setCardBack).catch(() => {
      setCardBack("./Tarot-Ascii/cardBack.txt");
    });
  }, []);

  useEffect(() => {
    const el = deckPressRef.current;
    if (!el) return;

    const block = (event: Event) => {
      event.preventDefault();
    };

    el.addEventListener("touchstart", block, { passive: false });
    el.addEventListener("contextmenu", block);
    el.addEventListener("selectstart", block);
    return () => {
      el.removeEventListener("touchstart", block);
      el.removeEventListener("contextmenu", block);
      el.removeEventListener("selectstart", block);
    };
  }, [ritualMode, phase]);

  useEffect(() => {
    if (openIndex == null || phase !== "cardsDown") return;
    const point = slotCanvasPoint(metrics, openIndex);
    const size = cardPixelSize(metrics.cardFontPx);
    boardRef.current?.focusCanvasPoint(point.x, point.y, {
      bottomInset: 210,
      fitWidth: size.width,
      fitHeight: size.height,
    });
  }, [openIndex, metrics, phase]);


  const renderCardColumn = (card: DrawnCard, i: number) => {  
    const disabled = flipLock || !canFlipMore;
    
    return (
      <div className="cardColumn" style={{ textAlign: "center" }}>
        <div className="slotLabel">{card.label}</div>

        <CardHitArea
          revealed={card.revealed}
          onToggle={() => setOpenIndex((open) => (open === i ? null : i))}
        >
          <TiltWrap i={i} enabled={phase === "cardsDown"}>
            <div className="cardFrame">
              <FlipCard
                back={cardBack}
                face={card.text}
                reversed={card.reversed}
                disabled={disabled}
                onRevealed={() => {
                  setFlipLock(true);
                  window.setTimeout(() => setFlipLock(false), 600);
                  setRevealedCount((n) => n + 1);
                  setOpenIndex(i);
                  setDrawn((prev) =>
                    prev.map((x) => (x.path === card.path ? { ...x, revealed: true } : x))
                  );
                }}
              />
            </div>
          </TiltWrap>
        </CardHitArea>
      </div>
    );
  };

  const renderSpreadBoard = () => (
    <BoardViewport ref={boardRef} key={spread} boardWidth={metrics.width} boardHeight={metrics.height}>
      <div
        className={`spreadBoard ${spread}`}
        style={{
          width: `${metrics.width}px`,
          height: `${metrics.height}px`,
          ["--card-font" as string]: `${metrics.cardFontPx}px`,
        } as CSSProperties}
      >
        {metrics.slots.map((slot, i) => {
          const card = drawn[i];
          if (!card) return null;

          const transform =
            `translateX(-50%) translate(${slot.tx}px, ${slot.ty}px)` +
            (slot.rotate ? ` rotate(${slot.rotate}deg)` : "");

          return (
            <div
              key={`${slot.position}-${card.path}`}
              className={`slot ${slot.position}${openIndex === i ? " isFocused" : ""}`}
              style={{
                left: "50%",
                top: 0,
                transform,
                ["--slot-z" as string]: String(slot.z ?? 1),
              } as CSSProperties}
            >
              {renderCardColumn(card, i)}
            </div>
          );
        })}
      </div>
    </BoardViewport>
  );

  useEffect(() => {
    if (ritualMode !== "keys") return;
    const updateFromCollector = () => {
      const s = collector.getState();
      if (s.ritualStarted && phase === "ritual") setPhase("shuffling");
      return s;
    };
    
    const onDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);

      if (!typing) {
        if (e.code === "Space" || RITUAL_KEYS.has(e.key)) {
          e.preventDefault();
        }
      }

      collector.onKeyDown(e);
      updateFromCollector();
    };

    
    const onUp = (e: KeyboardEvent) => {
      collector.onKeyUp(e);
      const s = updateFromCollector();

      if (s.done && phase === "shuffling" && drawn.length === 0) {
        const seed = collector.finalizeSeed();
        const rand = mulberry32(seed);
        const labels = getLabelsFor(spread);
        const paths = drawCard(labels.length, rand);

        Promise.all(
          paths.map(async (p, i) => {
            const meta = parseCard(p);
            const text = await fetch(p).then(r => r.text());
            const reversed = rand() < 0.35;
            const displayName = (meta.suit === "MajorArcana") ? meta.name : `${meta.name} of ${meta.suit}`;

            return { label: labels[i], path: p, text, name: displayName, reversed, revealed: false, };
          })
        ).then(cards => {
          setDrawn(cards);
          setRevealedCount(0);
          setFlipLock(false);
          setOpenIndex(null);
          setPhase("cardsDown");
        });
      }
    };
    
    window.addEventListener("keydown", onDown, { passive: false });
    window.addEventListener("keyup", onUp, { passive: false });

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [collector, phase, drawn.length, ritualMode, spread]);
  
  const maxFlips = getCardCount(spread);
  const canFlipMore = revealedCount < maxFlips; 
  const showRitual = phase === "ritual";
  const showShuffle = phase === "shuffling";
  const openCard = openIndex != null ? drawn[openIndex] ?? null : null;

  const goToCard = (index: number) => {
    if (index < 0) return;
    if (index >= drawn.length) {
      setOpenIndex(null);
      boardRef.current?.resetView();
      return;
    }
    setOpenIndex(index);
  };

  return (
    <>
      <AsciiBackground enabled={true} fps={12} frameCount={60} />

      <div className={`layer${phase === "cardsDown" ? " isReading" : ""}`}>
      
        <div className="modeToggle">
          <button onClick={() => setRitualMode("click")} disabled={phase !== "ritual"}>
            Click/Touch
          </button>
          <button onClick={() => setRitualMode("keys")} disabled={phase !== "ritual"}>
            Keyboard
          </button>
        </div>
      
        <div className="header">
          <pre className="title-ascii">{MIRROT_TITLE}</pre>
          <p className="subTitle">
            <i>A mirror's reflection of your soul</i>
          </p>
        </div>
      
        <div className={`stage${showRitual || showShuffle ? " isRitual" : ""}`}>
        <div className={`fade ${phase === "ritual" || phase === "shuffling" ? "fade-in" : "fade-out"}`}>

          <div className="ritual-ui">
            <div className="spreadToggle">
              <button
                className={spread === "ppf" ? "active" : ""}
                onClick={() => setSpread("ppf")}
                disabled={!showRitual}>
                Past, Present, Future
              </button>

              <button
                className={spread === "cc" ? "active" : ""}
                onClick={() => setSpread("cc")}
                disabled={!showRitual}>
                Celtic Cross
              </button>
            </div>

            <div className="ritualMain">
              {showShuffle ? (
                <div className="shuffle-wrap">
                  <DeckShuffle enabled={true} back={cardBack} count={9} speed={250} />
                  {ritualMode === "keys" ? (
                    <p>The deck begins to shuffle, release when you feel it right to do so...</p>
                  ) : null}
                </div>
              ) : ritualMode === "click" ? (
                <>
                  <div
                    ref={deckPressRef}
                    className="deckPress"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                      beginClickRitual();
                    }}
                    onPointerUp={(e) => { e.preventDefault(); endClickRitual(); }}
                    onPointerCancel={cancelClickRitual}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <DeckShuffle enabled={pressing} back={cardBack} count={9} speed={250} />
                  </div>

                  <p className="ritual-hint">
                    {pressing
                      ? "The deck begins to shuffle, release when you feel it right to do so..."
                      : "Press the deck to begin your reading"}
                  </p>
                </>
              ) : (
                <>
                  <img
                    src="./ritual.png"
                    className="png ritualKeys"
                    alt="Tarot ritual key placement"
                  />
                  <p style={{ opacity: 1 }}>
                    You will only receive a reading once all fingers have been sensed.
                  </p>
                </>
              )}
              </div>
            </div>
          </div>
          <div className={`fade boardFade ${phase === "cardsDown" ? "fade-in" : "fade-out"}`}>
            {drawn.length > 0 ? renderSpreadBoard() : null}
          </div>
        </div>
      </div>

      {openCard && openIndex != null && (
        <MeaningSheet
          card={openCard}
          index={openIndex}
          total={drawn.length}
          onClose={() => setOpenIndex(null)}
          onPrev={() => goToCard(openIndex - 1)}
          onNext={() => goToCard(openIndex + 1)}
        />
      )}
    </>
  );
}
