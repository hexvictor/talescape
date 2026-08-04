"use client";

import {
	type PropsWithChildren,
	type RefObject,
	createContext,
	useContext,
} from "react";
import type { CompiledReader, TalePath, ViewportSize } from "../types";

export type ReaderViewportContextValue = {
	compiled: CompiledReader | null;
	onChoosePath: (path: TalePath) => void;
	stageRef: RefObject<HTMLDivElement | null>;
	viewport: ViewportSize;
};

const ReaderViewportContext = createContext<ReaderViewportContextValue | null>(
	null,
);

/**

* Provides reader viewport render data to stage-level components.
*
* The provider remains available while reader compilation is pending. Consumers
* that require compiled reader data must handle `compiled === null`.
*
* @param props - Provider properties.
* @param props.children - Reader viewport subtree.
* @param props.value - Compiled reader state, camera viewport, path callback, and stage ref.
* @returns Context provider for one reader viewport.
*
* @example
* <ReaderViewportProvider value={value}>
* <ReaderStage />
* </ReaderViewportProvider>

*/
export function ReaderViewportProvider({
	children,
	value,
}: PropsWithChildren<{
	value: ReaderViewportContextValue;
}>): React.JSX.Element {
	return (
		<ReaderViewportContext.Provider value={value}>
			{children}
		</ReaderViewportContext.Provider>
	);
}

/**

* Reads the active reader viewport render context.
*
* @returns Compiled reader state, viewport, stage ref, and path selection callback.
*
* @example
* const { compiled, onChoosePath, viewport } = useReaderViewportContext();
  */
export function useReaderViewportContext(): ReaderViewportContextValue {
	const context = useContext(ReaderViewportContext);

	if (!context) {
		throw new Error(
			"useReaderViewportContext must be used inside ReaderViewportProvider.",
		);
	}

	return context;
}
