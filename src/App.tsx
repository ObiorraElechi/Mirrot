import { useEffect, useRef, useMemo, useState } from "react";
import './App.css';
import AsciiBackground from "./asciiBackground";
import DeckShuffle from "./DeckShuffle";
import { EntropyCollectorRitual, mulberry32 } from "./userEntropy";
import { drawCard, parseCard } from "./deck";
import type { CardPath } from "./deck";
import { MEANINGS_BY_PATH } from "./tarotMeanings";
import { TiltWrap } from "./TiltWrap"

function FlipCard({ back, face, reversed, disabled, onRevealed, }: { back: string; face: string; reversed: boolean; disabled?: boolean; onRevealed?: () => void;}) {
  const [flipped, setFlipped] = useState(false);

  const flipNow = () => {
    if (disabled) return;
    if (flipped) return;
    setFlipped(true);
    onRevealed?.();
  };

  return (
    <div
      className={`flipCard ${flipped ? "isFlipped" : ""} ${disabled ? "disabled" : ""}`}
      onPointerDown={(e) => {
        if (disabled || flipped) return;

        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        e.preventDefault();

        flipNow();
      }}
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

function MeaningWindow({ card }: { card: DrawnCard }) {
  const meaning = MEANINGS_BY_PATH[card.path];
  const line = card.reversed ? meaning.reversed : meaning.upright;

  const meta = parseCard(card.path);
  const suitClass =
    meta.suit === "MajorArcana" ? "suit-major" :
    meta.suit === "Cups"       ? "suit-cups" :
    meta.suit === "Pentacles"  ? "suit-pentacles" :
    meta.suit === "Swords"     ? "suit-swords" :
    meta.suit === "Wands"      ? "suit-wands" : "";

  return (
    <div className={`meaningWindow ${suitClass}`}>
      <div className={`meaningTitle ${suitClass}`}>
        {card.name}{card.reversed ? " (reversed)" : ""}
      </div>
      <div className="line">{line}</div>
    </div>
  );
}

function getLabelsFor(spread: SpreadType) {
  return spread === "ppf" ? PPF_LABELS : CELTIC_LABELS;
}

function getCardCount(spread: SpreadType) {
  return getLabelsFor(spread).length;
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
type SpreadType = "ppf" | "cc";

const PPF_LABELS = ["Past", "Present", "Future"] as const;

const CELTIC_LABELS = [
  "1. The Present",
  "2. The Challenge",
  "3. The Past",
  "4. The Future",
  "5. Above",
  "6. Below",
  "7. Advice",
  "8. External Influences",
  "9. Hopes & Fears",
  "10. Outcome",
] as const;

type LabelPPF = typeof PPF_LABELS[number];
type LabelCC = typeof CELTIC_LABELS[number];
type Label = LabelPPF | LabelCC;

type LayoutSlot = {
  label: Label;
  position: string;
  dx: number;
  dy: number;
};

const SPREAD_SCALE = 1.5;

const PPF_LAYOUT: LayoutSlot[] = [
  { label: "Past", position: "ppf-1", dx: -345, dy:  -850 },
  { label: "Present", position: "ppf-2", dx:   0,  dy: -850 },
  { label: "Future", position: "ppf-3",  dx:  345, dy: -850 },
]

const CC_LAYOUT: LayoutSlot[] = [
  { label: "1. The Present", position: "cc-1",  dx:   0,  dy: -675 },
  { label: "2. The Challenge", position: "cc-2",  dx:   0,  dy: -675 },
  { label: "3. The Past", position: "cc-3",  dx: -250, dy: -675 },
  { label: "4. The Future", position: "cc-4",  dx:  250, dy: -675 },
  { label: "5. Above", position: "cc-5",  dx:   0,  dy: -925 },
  { label: "6. Below", position: "cc-6",  dx:   0,  dy: -425 },
  { label: "7. Advice", position: "cc-7",  dx:  500, dy: -300 },
  { label: "8. External Influences", position: "cc-8",  dx:  500, dy: -550 },
  { label: "9. Hopes & Fears", position: "cc-9",  dx:  500, dy: -800 },
  { label: "10. Outcome", position: "cc-10", dx:  500, dy: -1050 },
];

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
  
  const SHUFFLE_AFTER_RELEASE_MS = 0;
  const [pressing, setPressing] = useState(false);
  const pressStartRef = useRef<number | null>(null);
  const clickSeedRef = useRef<number | null>(null);
  const dealTimerRef = useRef<number | null>(null);

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


  const renderCardColumn = (card: DrawnCard, i: number) => {  
    const disabled = flipLock || !canFlipMore;
    
    return (
      <div className="cardColumn" style={{ textAlign: "center" }}>
        <div style={{ opacity: 1, letterSpacing: 1.5 }}>{card.label}</div>

        <div className="cardHitArea">
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
                  setDrawn((prev) =>
                    prev.map((x) => (x.path === card.path ? { ...x, revealed: true } : x))
                  );
                }}
              />
            </div>
          </TiltWrap>

          {card.revealed && <MeaningWindow card={card} />}
        </div>
        </div>
    );
  };

  const renderSpreadBoard = (layout: LayoutSlot[]) => {
  const anchorY = spread === "ppf" ? Math.round(window.innerHeight * 0.50) : Math.round(window.innerHeight * 0.70);

  return (
    <div className={`spreadBoard ${spread}`}>
      {layout.map((slot, i) => {
        const c = drawn[i];
        if (!c) return null;

        const z = slot.position === "cc-2" ? 20 : slot.position === "cc-1" ? 10 : 1;
        const isChallenge = slot.position === "cc-2";

        const tx = slot.dx * SPREAD_SCALE;
        const ty = slot.dy * SPREAD_SCALE;

        const slotTransform =
          `translateX(-50%) translate(${tx}px, ${ty}px)` +
          (isChallenge ? " rotate(90deg)" : "");

        return (
          <div
            key={`${slot.position}-${c.path}`}
            className={`slot ${slot.position}`}
            style={{
              left: "50%",
              top: `${anchorY}px`,
              transform: slotTransform,
              ["--slot-z" as any]: z,
            }}
          >
            {renderCardColumn(c, i)}
          </div>
        );
      })}
      </div>
    );
  };

  const renderPPF = () => renderSpreadBoard(PPF_LAYOUT);
  const renderCC = () => renderSpreadBoard(CC_LAYOUT);

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

  return (
    <>
      <AsciiBackground enabled={true} fps={12} frameCount={60} />

      <div className="layer">
      
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
          <p style={{opacity: 0.8, fontSize: 18}}><i>A mirror's reflection of your soul</i></p>
        </div>
      
        <div className="stage">
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
                  <DeckShuffle enabled={true} count={9} speed={250} />
                  {ritualMode === "keys" ? (
                    <p>The deck begins to shuffle, release when you feel it right to do so...</p>
                  ) : null}
                </div>
              ) : ritualMode === "click" ? (
                <>
                  <div
                    style={{ display: "inline-block", cursor: "pointer", userSelect: "none" }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                      beginClickRitual();
                    }}
                    onPointerUp={(e) => { e.preventDefault(); endClickRitual(); }}
                    onPointerCancel={cancelClickRitual}
                  >
                    <DeckShuffle enabled={pressing} count={9} speed={250} />
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
                    className="png"
                    alt="Tarot ritual key placement"
                    style={{ maxWidth: "50%", height: "auto" }}
                  />
                  <p style={{ opacity: 1 }}>
                    You will only receive a reading once all fingers have been sensed.
                  </p>
                </>
              )}
              </div>
            </div>
          </div>
          <div className={`fade ${phase === "cardsDown" ? "fade-in" : "fade-out"}`}>
            {spread === "ppf" ? renderPPF() : renderCC() }
          </div>
        </div>
      </div>
    </>
  );
}