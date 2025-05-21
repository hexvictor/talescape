"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { useScrollNavigation } from "~/hooks/useScrollNavigation";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

interface TaleReaderContextProps {
	scrollToEntry: (entryIndex: number) => void;
	scrollToPage: (entryIndex: number, pageIndex: number) => void;
}

const TaleReaderContext = createContext<TaleReaderContextProps | null>(null);

export function TaleReaderProvider({
	children,
}: { children: React.ReactNode }) {
	const { scrollToEntry, scrollToPage } = useScrollNavigation();

	return (
		<TaleReaderContext.Provider
			value={{
				scrollToEntry,
				scrollToPage,
			}}
		>
			{children}
		</TaleReaderContext.Provider>
	);
}

export function useTaleReaderContext() {
	const context = useContext(TaleReaderContext);
	if (!context) {
		throw new Error(
			"useTaleReaderContext must be used within a TaleReaderProvider",
		);
	}
	return context;
}
