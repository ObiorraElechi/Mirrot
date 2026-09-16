import { createContext, useContext } from "react";

export type GestureState = { panned: { current: boolean } };

export const BoardGestureContext = createContext<GestureState | null>(null);

/**
 * Lets a card ignore a pointer release that was really the end of a pan or
 * pinch, so dragging the board never flips a card by accident.
 */
export function useBoardGesture() {
  return useContext(BoardGestureContext);
}
