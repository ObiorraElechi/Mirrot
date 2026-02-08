import { useEffect, useMemo, useState } from "react";
import './App.css';
import { EntropyCollector, mulberry32 } from "./userEntropy";
import { drawCard, parseCard } from "./deck";

function TarotCard({text}: {text: string}) {
  return <pre className="ascii">{text}</pre>;
}

export default function App() {
  const collector = useMemo(() => new EntropyCollector(12), []);
  const [presses, setPresses] = useState(0);
  const [done, setDone] = useState(false);
  const [cardsText, setCardsText] = useState<string[]>([]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      collector.onKeyDown(e);
      const s = collector.getState();
      setPresses(s.presses);
      setDone(s.done);
    };

    const onUp = (e: KeyboardEvent) => {
      collector.onKeyUp(e);
      const s = collector.getState();
      setPresses(s.presses);
      setDone(s.done);

      if (s.done) {
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
  }, [collector]);

  return (
    <div>
      <h1>Tarot Reader</h1>

      {!done && (
        <p>Ritual: press and hold down on the allowed keys ({presses}/12)</p>
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

