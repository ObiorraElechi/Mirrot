import { useEffect, useMemo, useState } from "react";
import './App.css';
import { EntropyCollectorChord, mulberry32 } from "./userEntropy";
import { drawCard } from "./deck";

function TarotCard({text}: {text: string}) {
  return <pre className="ascii">{text}</pre>;
}

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
export default function App() {
  const collector = useMemo(() => new EntropyCollectorChord(), []);
  const [heldCount, setHeldCount] = useState(0);
  const [requiredCount, setRequiredCount] = useState(0);
  const [chordStarted, setChordStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [chordMs, setChordMs] = useState<number | null>(null);
  const [cardsText, setCardsText] = useState<string[]>([]);

  useEffect(() => {
    const updateFromCollector = () => {
      const s = collector.getState();
      setHeldCount(s.heldCount);
      setRequiredCount(s.requiredCount);
      setChordStarted(s.chordStarted);
      setDone(s.done);
      setChordMs(s.chordMs);
      return s;
    };

    const onDown = (e: KeyboardEvent) => {
      collector.onKeyDown(e);
      updateFromCollector();

    };

    const onUp = (e: KeyboardEvent) => {
      collector.onKeyUp(e);
      const s = updateFromCollector();
      if (s.done && cardsText.length === 0) {
        const seed = collector.finalizeSeed();
        const rand = mulberry32(seed);
        const paths = drawCard(3, rand);
        Promise.all(paths.map(p => fetch(p).then(r => r.text()))).then(setCardsText);
      }
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [collector, cardsText.length]);

  return (
    <div>
      <pre className="title-ascii">{MIRROT_TITLE}</pre>
      <p>
        To engage meaningfully with the cards drawn from the deck, press and hold the keys depicted in the diagram:
        <br />
      </p>
      <img 
        src="/ritual.png" 
        className="png" 
        alt="Tarot ritual key placement"
        style={{ maxWidth: "100%", height: "auto"}}
      />

      {!done && (
        <p>Ritual Status:({heldCount}/{requiredCount})
          {chordStarted ? " — timing…" : ""}</p>
      )}

      {cardsText.length > 0 && (
        <div> 
          {cardsText.map((t, i) => (
            <TarotCard key={i} text={t} />
          ))}
        </div>
      )}
    </div>
  );
}

