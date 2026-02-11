export type Suit = "MajorArcana" | "Cups" | "Pentacles" | "Swords" | "Wands";
export type MajorRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21;
export type MinorRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
// export type MinorFaces = "Ace" | "Page" | "Knight" | "Queen" | "King";
export type Card = | { suit: "MajorArcana"; rank: MajorRank; name: string; path: CardPath } | { suit: Exclude<Suit, "MajorArcana">; rank: MinorRank; name: string; path: CardPath };

export const DECK = [
    "/Tarot-Ascii/MajorArcana/00.txt",
    "/Tarot-Ascii/MajorArcana/01.txt",
    "/Tarot-Ascii/MajorArcana/02.txt",
    "/Tarot-Ascii/MajorArcana/03.txt",
    "/Tarot-Ascii/MajorArcana/04.txt",
    "/Tarot-Ascii/MajorArcana/05.txt",
    "/Tarot-Ascii/MajorArcana/06.txt",
    "/Tarot-Ascii/MajorArcana/07.txt",
    "/Tarot-Ascii/MajorArcana/08.txt",
    "/Tarot-Ascii/MajorArcana/09.txt",
    "/Tarot-Ascii/MajorArcana/10.txt",
    "/Tarot-Ascii/MajorArcana/11.txt",
    "/Tarot-Ascii/MajorArcana/12.txt",
    "/Tarot-Ascii/MajorArcana/13.txt",
    "/Tarot-Ascii/MajorArcana/14.txt",
    "/Tarot-Ascii/MajorArcana/15.txt",
    "/Tarot-Ascii/MajorArcana/16.txt",
    "/Tarot-Ascii/MajorArcana/17.txt",
    "/Tarot-Ascii/MajorArcana/18.txt",
    "/Tarot-Ascii/MajorArcana/19.txt",
    "/Tarot-Ascii/MajorArcana/20.txt",
    "/Tarot-Ascii/MajorArcana/21.txt",
    "/Tarot-Ascii/Cups/01.txt",
    "/Tarot-Ascii/Cups/02.txt",
    "/Tarot-Ascii/Cups/03.txt",
    "/Tarot-Ascii/Cups/04.txt",
    "/Tarot-Ascii/Cups/05.txt",
    "/Tarot-Ascii/Cups/06.txt",
    "/Tarot-Ascii/Cups/07.txt",
    "/Tarot-Ascii/Cups/08.txt",
    "/Tarot-Ascii/Cups/09.txt",
    "/Tarot-Ascii/Cups/10.txt",
    "/Tarot-Ascii/Cups/11.txt",
    "/Tarot-Ascii/Cups/12.txt",
    "/Tarot-Ascii/Cups/13.txt",
    "/Tarot-Ascii/Cups/14.txt",
    "/Tarot-Ascii/Pentacles/01.txt",
    "/Tarot-Ascii/Pentacles/02.txt",
    "/Tarot-Ascii/Pentacles/03.txt",
    "/Tarot-Ascii/Pentacles/04.txt",
    "/Tarot-Ascii/Pentacles/05.txt",
    "/Tarot-Ascii/Pentacles/06.txt",
    "/Tarot-Ascii/Pentacles/07.txt",
    "/Tarot-Ascii/Pentacles/08.txt",
    "/Tarot-Ascii/Pentacles/09.txt",
    "/Tarot-Ascii/Pentacles/10.txt",
    "/Tarot-Ascii/Pentacles/11.txt",
    "/Tarot-Ascii/Pentacles/12.txt",
    "/Tarot-Ascii/Pentacles/13.txt",
    "/Tarot-Ascii/Pentacles/14.txt",
    "/Tarot-Ascii/Swords/01.txt",
    "/Tarot-Ascii/Swords/02.txt",
    "/Tarot-Ascii/Swords/03.txt",
    "/Tarot-Ascii/Swords/04.txt",
    "/Tarot-Ascii/Swords/05.txt",
    "/Tarot-Ascii/Swords/06.txt",
    "/Tarot-Ascii/Swords/07.txt",
    "/Tarot-Ascii/Swords/08.txt",
    "/Tarot-Ascii/Swords/09.txt",
    "/Tarot-Ascii/Swords/10.txt",
    "/Tarot-Ascii/Swords/11.txt",
    "/Tarot-Ascii/Swords/12.txt",
    "/Tarot-Ascii/Swords/13.txt",
    "/Tarot-Ascii/Swords/14.txt",
    "/Tarot-Ascii/Wands/01.txt",
    "/Tarot-Ascii/Wands/02.txt",
    "/Tarot-Ascii/Wands/03.txt",
    "/Tarot-Ascii/Wands/04.txt",
    "/Tarot-Ascii/Wands/05.txt",
    "/Tarot-Ascii/Wands/06.txt",
    "/Tarot-Ascii/Wands/07.txt",
    "/Tarot-Ascii/Wands/08.txt",
    "/Tarot-Ascii/Wands/09.txt",
    "/Tarot-Ascii/Wands/10.txt",
    "/Tarot-Ascii/Wands/11.txt",
    "/Tarot-Ascii/Wands/12.txt",
    "/Tarot-Ascii/Wands/13.txt",
    "/Tarot-Ascii/Wands/14.txt",
] as const;

const SUITS = ["MajorArcana", "Cups", "Pentacles", "Swords", "Wands"];

function isSuit(x: string): x is Suit {
    return SUITS.includes(x as Suit);
}

function toIntFilename(name: string): number | null {
    const m = name.match(/^(\d+)\.txt$/);
    return m ? Number(m[1]) : null;
}

export function minorRankLabel(rank: MinorRank): string {
  switch (rank) {
    case 1: return "Ace";
    case 11: return "Page";
    case 12: return "Knight";
    case 13: return "Queen";
    case 14: return "King";
    default: return String(rank);
  }
}

export function majorRankLabel(rank: MajorRank): string {
  switch (rank) {
    case 0: return "The Fool";
    case 1: return "The Magician";
    case 2: return "The High Priestess";
    case 3: return "The Empress";
    case 4: return "The Emperor";
    case 5: return "The Hierophant";
    case 6: return "The Lovers";
    case 7: return "The Chariot";
    case 8: return "Strength";
    case 9: return "The Hermit";
    case 10: return "The Wheel of Fortune";
    case 11: return "Justice";
    case 12: return "The Hanged Man";
    case 13: return "Death";
    case 14: return "Temperance";
    case 15: return "The Devil";
    case 16: return "The Tower";
    case 17: return "The Star";
    case 18: return "The Moon";
    case 19: return "The Sun";
    case 20: return "Judgement";
    case 21: return "The World";
    default: return String(rank);
  }
}

export function parseCard(path: CardPath): Card {
    // i.e.  "/Tarot-Ascii/Cups/14.txt"
    const parts = path.split("/").filter(Boolean);

    const suit = parts[1];
    const fileRank = parts[2];

    if (!suit || !fileRank || !isSuit(suit)) {
        throw new Error(`Invalid card path (suit/file): ${path}`);
    }

    const n = toIntFilename(fileRank);
    if (n === null) throw new Error(`Invalid card filename: ${path}`);

    if (suit === "MajorArcana") {
        if (n < 0 || n > 21) throw new Error(`Major Arcana  index beyond range of [0, 21]: ${path}`);
        const rank = n as MajorRank;
        return { suit, rank, name: majorRankLabel(rank), path };
    } else {
        if (n < 1 || n > 14) throw new Error(`Minor Arcana index beyond range of (0, 14]: ${path}`);
        const rank = n as MinorRank;
        return { suit, rank, name: minorRankLabel(rank), path };
    }
}

export type CardPath = (typeof DECK)[number];

export function drawCard(k: number, rand = Math.random): CardPath[] {
    if (!Number.isInteger(k) || k < 0) throw new Error("k must be a non-negative integer");
    if (k > DECK.length) throw new Error("k cannot exceed deck size");

    const idx = Array.from({length: DECK.length }, (_, i) => i);
    for (let i = 0; i < k; i++) {
        const j = i + Math.floor(rand() * (DECK.length - i));
        [idx[i], idx[j]] = [idx[j], idx[i]];
    }

    return idx.slice(0, k).map(i => DECK[i]);
}

export function drawCards(k: number, rand = Math.random): Card[] {
  return drawCard(k, rand).map(parseCard);
}