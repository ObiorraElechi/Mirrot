import { useEffect, useMemo, useState } from "react";
import './App.css';
import AsciiBackground from "./asciiBackground";
import DeckShuffle from "./DeckShuffle";
import { EntropyCollectorRitual, mulberry32 } from "./userEntropy";
import { drawCard, parseCard } from "./deck";

function TarotCard({text}: {text: string}) {
  return <pre className="ascii">{text}</pre>;
}

const RITUAL_KEYS = new Set(["a", "s", "d", "f", " ", "j", "k", "l", ";"])
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
  path: string;
  text: string;
  name: string;
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

  useEffect(() => {
    const updateFromCollector = () => {
      
      const s = collector.getState();

      setHeldCount(s.heldCount);
      setRequiredCount(s.requiredCount);
      setRitualStarted(s.ritualStarted);
      setDone(s.done);
      setRitualMs(s.ritualMs);
      
      
      if (s.ritualStarted && phase === "ritual") {
         setPhase("shuffling"); 
      }
      
      return s;
    };

    const onDown = (e: KeyboardEvent) => {
      if (RITUAL_KEYS.has(e.key)) {
        e.preventDefault();
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
            const meta = parseCard(p as any);
            const text = await fetch(p).then(r => r.text());
            return { label: labels[i], path: p, text, name: meta.name };
          })
        ).then(cards => {
          setDrawn(cards);
          setPhase("cardsDown");
        });
      }
    };

    window.addEventListener("keydown", onDown, { passive: false});
    window.addEventListener("keyup", onUp, { passive: false});
    
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [collector, phase, drawn.length]);
      
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
          <div style={{ display: "flex", gap: 32, marginTop: 24 }}>
              {drawn.map(c => (
                <div key={c.path} style={{ textAlign: "center" }}>
                  <div style={{ opacity: 0.8, letterSpacing: "0.1em" }}>{c.label}</div>
                  <pre className="ascii">{c.text}</pre>
                  <div style={{ marginTop: 8, fontWeight: 600 }}>{c.name}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
