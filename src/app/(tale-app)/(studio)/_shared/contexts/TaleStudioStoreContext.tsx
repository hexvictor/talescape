"use client";

import { createContext, useContext } from "react";
import type { StoreApi } from "zustand/vanilla";
import type { TaleStudioState } from "../store/taleStudioStore";

export const TaleStudioStoreContext =
	createContext<StoreApi<TaleStudioState> | null>(null);

export function useTaleStudioStoreInstance() {
	const store = useContext(TaleStudioStoreContext);
	if (!store)
		throw new Error("Studio store must be used inside TaleStudioProvider.");
	return store;
}
