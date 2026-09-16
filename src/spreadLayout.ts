export type SpreadType = "ppf" | "cc";

export const PPF_LABELS = ["Past", "Present", "Future"] as const;

export const CELTIC_LABELS = [
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
export type Label = LabelPPF | LabelCC;

export type LayoutSlot = {
  label: Label;
  position: string;
  dx: number;
  dy: number;
  rotate?: number;
  z?: number;
};

// Every card is a fixed character grid, so its rendered size is
// columns * advance * font-size. Iosevka's advance is half an em.
// The art files are all 100 columns but run 81-87 rows (the back is 82), so
// the grid is sized to the tallest and shorter cards are centred inside it.
// Otherwise a card's black panel changes size between neighbours and on flip.
export const CARD_COLS = 100;
export const CARD_ROWS = 87;
const CHAR_ADVANCE_EM = 0.5;
const CARD_LINE_HEIGHT = 1;

// Position label above each card, plus room under the lowest card so the
// hover popover is not clipped by the viewport's overflow.
const LABEL_BLOCK = 24;

export function cardPixelSize(fontPx: number) {
  return {
    width: CARD_COLS * CHAR_ADVANCE_EM * fontPx,
    height: CARD_ROWS * CARD_LINE_HEIGHT * fontPx,
  };
}

const BOARD_PAD = 48;
const POPOVER_ROOM = 220;

const SPREAD_SCALE = 1.5;

const PPF_LAYOUT: LayoutSlot[] = [
  { label: "Past", position: "ppf-1", dx: -345, dy: -850 },
  { label: "Present", position: "ppf-2", dx: 0, dy: -850 },
  { label: "Future", position: "ppf-3", dx: 345, dy: -850 },
];

const CC_LAYOUT: LayoutSlot[] = [
  { label: "1. The Present", position: "cc-1", dx: 0, dy: -675, z: 10 },
  { label: "2. The Challenge", position: "cc-2", dx: 0, dy: -675, rotate: 90, z: 20 },
  { label: "3. The Past", position: "cc-3", dx: -250, dy: -675 },
  { label: "4. The Future", position: "cc-4", dx: 250, dy: -675 },
  { label: "5. Above", position: "cc-5", dx: 0, dy: -925 },
  { label: "6. Below", position: "cc-6", dx: 0, dy: -425 },
  { label: "7. Advice", position: "cc-7", dx: 450, dy: -300 },
  { label: "8. External Influences", position: "cc-8", dx: 450, dy: -550 },
  { label: "9. Hopes & Fears", position: "cc-9", dx: 450, dy: -800 },
  { label: "10. Outcome", position: "cc-10", dx: 450, dy: -1050 },
];

type SpreadConfig = {
  labels: readonly Label[];
  slots: LayoutSlot[];
  cardFontPx: number;
};

export const SPREADS: Record<SpreadType, SpreadConfig> = {
  ppf: { labels: PPF_LABELS, slots: PPF_LAYOUT, cardFontPx: 8 },
  cc: { labels: CELTIC_LABELS, slots: CC_LAYOUT, cardFontPx: 4 },
};

export function getLabelsFor(spread: SpreadType) {
  return SPREADS[spread].labels;
}

export function getCardCount(spread: SpreadType) {
  return SPREADS[spread].labels.length;
}

export type PlacedSlot = LayoutSlot & {
  /** Offsets in board-local space, already centred and scaled. */
  tx: number;
  ty: number;
};

export type BoardMetrics = {
  width: number;
  height: number;
  cardFontPx: number;
  slots: PlacedSlot[];
};

/** Canvas-local centre of a slot, including the label sitting above the card. */
export function slotCanvasPoint(metrics: BoardMetrics, index: number) {
  const slot = metrics.slots[index];
  const { height } = cardPixelSize(metrics.cardFontPx);
  return {
    x: metrics.width / 2 + slot.tx,
    y: slot.ty + LABEL_BLOCK + height / 2,
  };
}

/**
 * Turns a spread's slot offsets into a self-contained logical canvas: a fixed
 * width/height plus per-slot offsets measured from the canvas centre. Nothing
 * here reads the viewport, so the geometry is identical on every device and
 * only the surrounding scale factor changes.
 */
export function boardMetrics(spread: SpreadType): BoardMetrics {
  const cfg = SPREADS[spread];

  const cardW = CARD_COLS * CHAR_ADVANCE_EM * cfg.cardFontPx;
  const cardH = CARD_ROWS * CARD_LINE_HEIGHT * cfg.cardFontPx;
  const slotW = cardW;
  const slotH = LABEL_BLOCK + cardH;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const slot of cfg.slots) {
    const cx = slot.dx * SPREAD_SCALE;
    const top = slot.dy * SPREAD_SCALE;

    // A slot rotates about its own centre, so a quarter turn swaps its footprint.
    const quarterTurned = (slot.rotate ?? 0) % 180 !== 0;
    const w = quarterTurned ? slotH : slotW;
    const h = quarterTurned ? slotW : slotH;
    const cy = top + slotH / 2;

    minX = Math.min(minX, cx - w / 2);
    maxX = Math.max(maxX, cx + w / 2);
    minY = Math.min(minY, cy - h / 2);
    maxY = Math.max(maxY, cy + h / 2);
  }

  const centreX = (minX + maxX) / 2;
  const width = maxX - minX + BOARD_PAD * 2;
  const height = maxY - minY + BOARD_PAD * 2 + POPOVER_ROOM;

  const slots: PlacedSlot[] = cfg.slots.map((slot) => ({
    ...slot,
    tx: slot.dx * SPREAD_SCALE - centreX,
    ty: slot.dy * SPREAD_SCALE - (minY - BOARD_PAD),
  }));

  return { width, height, cardFontPx: cfg.cardFontPx, slots };
}
