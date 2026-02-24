import { atom } from "jotai";
import type { TrashResourceType } from "./types";

export const PAGE_SIZE = 10;
export const activeTabAtom = atom<TrashResourceType>("users");
export const searchAtom = atom("");
export const pageAtom = atom(1);
