import { devtools } from "zustand/middleware";
import { createStore, type StateCreator } from "zustand/vanilla";
import type { TaleProgressSchema } from "~/server/db/schema";
import type { Tale } from "~/features/tale-reader/types/taleStructure";
import { createTaleSlice, type TaleSlice } from "./slices/taleSlice";
import { createUiSlice, type UiSlice } from "./slices/uiSlice";
import { createHubSlice, type HubSlice } from "./slices/hubSlice";
import {
  createNavigationSlice,
  type NavigationSlice,
} from "./slices/navigationSlice";
import {
  createProgressSlice,
  type ProgressSlice,
} from "./slices/progressSlice";
import { createScrollSlice, type ScrollSlice } from "./slices/scrollSlice";
import {
  createCommandsSlice,
  type CommandsSlice,
} from "./slices/commandsSlice";

export type TaleReaderState = TaleSlice &
  UiSlice &
  HubSlice &
  NavigationSlice &
  ProgressSlice &
  ScrollSlice &
  CommandsSlice;

export function createTaleReaderStore(
  initialTale: Tale,
  initialProgress: TaleProgressSchema,
) {
  const initializer: StateCreator<TaleReaderState> = (set, get, api) => ({
    ...createTaleSlice(initialTale)(set, get, api),
    ...createUiSlice()(set, get, api),
    ...createHubSlice()(set, get, api),
    ...createNavigationSlice(initialTale, initialProgress)(set, get, api),
    ...createProgressSlice(initialProgress)(set, get, api),
    ...createScrollSlice()(set, get, api),
    ...createCommandsSlice()(set, get, api),
  });

  return createStore<TaleReaderState>()(
    devtools(initializer, { name: "TaleReaderStore" }),
  );
}