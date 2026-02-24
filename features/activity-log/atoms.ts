import { atom } from "jotai";

export const PAGE_SIZE = 10;

export const searchAtom = atom("");
export const pageAtom = atom(1);
export const actionTypeFilterAtom = atom("");
export const statusFilterAtom = atom("");
export const dateFromAtom = atom("");
export const dateToAtom = atom("");
