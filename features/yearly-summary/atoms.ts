import { atom } from "jotai";

export const selectedYearAtom = atom<number>(new Date().getFullYear());
