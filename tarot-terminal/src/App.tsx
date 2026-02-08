import { useEffect, useState } from "react";
import './App.css'

function TarotCard({text}: {text: string}) {
  return <pre className="ascii">{text}</pre>;
}

export default function App() {
  const [card, setCard] = useState("");

  useEffect(() => { fetch("/Tarot-Ascii/MajorArcana/00.txt").then(r => r.text()).then(setCard); }, []);
  
  return (
      <div>
        <h1>Tarot Reader</h1>
        <TarotCard text={card} />
      </div>
  );
}

