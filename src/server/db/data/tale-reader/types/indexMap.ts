import type { Block } from "./blocks";
import type { Entry } from "./entries";
import type { Fragment } from "./fragments";
import type { Page } from "./pages";
import type { Part } from "./parts";
import type { Section } from "./sections";

export type EntrysById = Record<string, Entry>;
export type PartsById = Record<string, Part>;
export type FragmentsById = Record<string, Fragment>;
export type SectionsById = Record<string, Section>;
export type BlocksById = Record<string, Block>;
export type PagesById = Record<string, Page>;
