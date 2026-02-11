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

        // keep the pointer “locked” to this element even if it moves
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

        // prevent text selection / weird default behaviors
        e.preventDefault();

        flipNow();
      }}
      role="button"
      aria-disabled={disabled}
      tabIndex={0}
    >
      <div className="flipInner">
        <pre className="ascii flipSide flipBack">{back}</pre>
        <pre className={`ascii flipSide flipFront ${reversed ? "rev" : ""}`}>{face}</pre>
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
    <div className="meaningWindow">
      <div className={`meaningTitle ${suitClass}`}>
        {card.name}{card.reversed ? " (reversed)" : ""}
      </div>
      <div className="line">{line}</div>
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
 type Label = "Past"| "Present" | "Future";

 type DrawnCard = {
  label: Label;
  path: CardPath;
  text: string;
  name: string;
  reversed: boolean;
  revealed: boolean;
 };
 
export default function App() {
  const collector = useMemo(() => new EntropyCollectorRitual(), []);
  const [phase, setPhase] = useState<Phase>("ritual");
  const [heldCount, setHeldCount] = useState(0);
  const [requiredCount, setRequiredCount] = useState(0);
  const [ritualStarted, setRitualStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [ritualMs, setRitualMs] = useState<number | null>(null);
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [cardBack, setCardBack] = useState<string>("LOADING BACK...");
  const [cardTransition, setCardTransition] = useState<string | undefined>(undefined);

  // NEW: reveal rules
  const [revealedCount, setRevealedCount] = useState(0);
  const [flipLock, setFlipLock] = useState(false); // allow only one flip at a time

   useEffect(() => {
    fetch("/Tarot-Ascii/cardBack.txt").then(r => r.text()).then(setCardBack).catch(() => {
      setCardBack("/Tarot-Ascii/cardBack.txt");
    });

    fetch("/Tarot-Ascii/cardTransition.txt")
      .then(r => r.text())
      .then(setCardTransition)
      .catch(() => {
        // transition optional
        setCardTransition(undefined);
      });
  }, []);

  useEffect(() => {
    const updateFromCollector = () => {
      const s = collector.getState();
      if (s.ritualStarted && phase === "ritual") setPhase("shuffling");
      return s;
    };

    const onDown = (e: KeyboardEvent) => {
      // don’t hijack typing in inputs/textareas
      const el = e.target as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);

      if (!typing) {
        // stop Space scrolling + stop browser shortcuts while ritual keys are held
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
        const paths = drawCard(3, rand);
        const labels: Label[] = ["Past", "Present", "Future"];

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
  }, [collector, phase, drawn.length]);

  const canFlipMore = revealedCount < 3; // “max 3 flips” rule (here it’s literally 3 cards)

  return (
    <>
      <AsciiBackground enabled={true} fps={12} frameCount={60} />

      <div className="layer">
      
      <div className="header">
        <pre className="title-ascii">{MIRROT_TITLE}</pre>
        <p><i>A mirror's reflection of your soul</i></p>
      </div>
      
      <div className="stage">
        <div className={`fade ${phase === "ritual" ? "fade-in" : "fade-out"}`}>
          <div className="ritual-ui">
            <p>
              Currently, there is only support for "Past, Present, and Future" Tarot Readings.
              <br />
              To draw from the deck, press and hold the keys depicted in the diagram.
            </p>

            <img 
              src="/ritual.png" 
              className="png" 
              alt="Tarot ritual key placement"
              style={{ maxWidth: "100%", height: "auto"}}
            />
          
            <p> 
              <br />
              You will only receive a reading once all fingers have been sensed. 
              <br />
            </p>
          </div>
        </div>
        
        <div className={`fade ${phase === "shuffling" ? "fade-in" : "fade-out"}`}>
          <div className="shuffle-wrap">
            <DeckShuffle enabled={phase ==="shuffling"} count={9} speed={250} />
            <p>The deck begins to shuffle, release when you feel it right to do so...</p>
          </div>
        </div>

        <div className={`fade ${phase === "cardsDown" ? "fade-in" : "fade-out"}`}>
          <div className="dealRow">
            {drawn.map((c, i) => {
              const disabled = flipLock || !canFlipMore;

              return (
                <div key={c.path} className="cardColumn" style={{ textAlign: "center" }}>
                  <div style={{ opacity: 0.8, letterSpacing: "0.1em" }}>{c.label}</div>

                  <TiltWrap i={i} enabled={phase === "cardsDown"}>
                    <FlipCard
                      back={cardBack}
                      face={c.text}
                      reversed={c.reversed}
                      disabled={disabled}
                      onRevealed={() => {
                        setFlipLock(true);
                        window.setTimeout(() => setFlipLock(false), 600);
                        setRevealedCount((n) => n + 1);

                        setDrawn((prev) =>
                          prev.map((card) =>
                            card.path === c.path ? { ...card, revealed: true } : card
                          )
                        );
                      }}
                    />
                  </TiltWrap>

                  {c.revealed && <MeaningWindow card={c} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}