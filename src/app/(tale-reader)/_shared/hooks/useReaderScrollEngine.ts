"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import {
	useReaderStore,
	useReaderStoreInstance,
} from "~/app/(tale-reader)/_shared/contexts/ReaderStoreContext";
import {
	type ReaderScrollEngineApi,
	createReaderScrollEngine,
} from "~/app/(tale-reader)/_shared/scroll-engine/createReaderScrollEngine";
import { createScrollDriver } from "~/app/(tale-reader)/_shared/scroll-engine/scrollDriver";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

type UseReaderScrollEngineArgs = {
	wrapperRef: RefObject<HTMLElement | null>;
};

/**
 * Runs the reader scroll engine for the current viewport.
 *
 * @param wrapperRef - Ref for the ScrollSmoother wrapper element. The engine
 * uses it as the root for measuring reader structure and waiting for images.
 *
 * The hook owns the React lifecycle while the engine factory owns DOM
 * measurement, GSAP setup, snapping, restoration, and cleanup. Keeping the hook
 * small prevents layout logic from being spread across multiple React effects.
 */
export function useReaderScrollEngine({
	wrapperRef,
}: UseReaderScrollEngineArgs) {
	const store = useReaderStoreInstance();

	const readerHubOpen = useReaderStore((s) => s.taleHub.isOpen);
	const isStructureMounted = useReaderStore((s) => s.reader.isStructureMounted);
	const setScrollApi = useReaderStore((s) => s.scroll.setApi);
	const clearApi = useReaderStore((s) => s.scroll.clearApi);
	const setIsLayoutReady = useReaderStore((s) => s.reader.setIsLayoutReady);
	const setIsInitialLoadComplete = useReaderStore(
		(s) => s.reader.setIsInitialLoadComplete,
	);
	const setProgressTrackingPaused = useReaderStore(
		(s) => s.progress.setIsTrackingPaused,
	);

	// biome-ignore lint/suspicious/noExplicitAny:
	const smootherRef = useRef<any>(null);
	const driver = useMemo(() => createScrollDriver(smootherRef), []);
	const engineRef = useRef<ReaderScrollEngineApi | null>(null);

	useGSAP(
		() => {
			ScrollTrigger.config({
				ignoreMobileResize: true,
				autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
			});

			const engine = createReaderScrollEngine({
				store,
				wrapperRef,
				driver,
				getReaderHubOpen: () => store.getState().taleHub.isOpen,
				setScrollApi,
				clearApi,
				setIsLayoutReady,
				setIsInitialLoadComplete,
				setProgressTrackingPaused,
			});

			engineRef.current = engine;
			engine.start();

			return () => {
				engine.destroy();
				engineRef.current = null;

				for (const trigger of ScrollTrigger.getAll()) {
					trigger.kill();
				}
			};
		},
		{ scope: wrapperRef },
	);

	useEffect(() => {
		engineRef.current?.setHubOpen(!!readerHubOpen);
	}, [readerHubOpen]);

	useEffect(() => {
		if (!isStructureMounted) return;

		const isInitialLoadComplete = store.getState().reader.isInitialLoadComplete;

		if (isInitialLoadComplete) {
			engineRef.current?.requestLayoutRefresh({
				reason: "visible-structure-mounted",
				mode: "quiet",
			});
			return;
		}

		engineRef.current?.requestLayoutRefresh({
			reason: "structure-mounted",
			mode: "initial",
			delay: 0,
		});
	}, [isStructureMounted, store]);

	return {};
}
