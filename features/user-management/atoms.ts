import { atom } from "jotai";

export const PAGE_SIZE = 5;

// Client-side UI state
export const searchAtom = atom("");
export const pageAtom = atom(1);
