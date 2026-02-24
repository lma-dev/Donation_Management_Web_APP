import { atom } from "jotai";

const now = new Date();

export const selectedMonthlyYearAtom = atom<number>(now.getFullYear());
export const selectedMonthlyMonthAtom = atom<number>(now.getMonth() + 1);
