"use client";

import { useRef } from "react";
import { usePersistReaderProgress } from "~/app/(tale-reader)/_shared/hooks/usePersistReaderProgress";
import { useReaderScrollEngine } from "~/app/(tale-reader)/_shared/hooks/useReaderScrollEngine";
import ReaderContent from "../ReaderContent";

export default function ReaderViewport() {
	const wrapperRef = useRef<HTMLDivElement | null>(null);

	useReaderScrollEngine({
		wrapperRef,
	});

	usePersistReaderProgress();

	return (
		<div
			id="smooth-wrapper"
			ref={wrapperRef}
			className="min-h-screen select-none"
			style={{ touchAction: "none", overscrollBehavior: "none" }}
		>
			<div
				id="smooth-content"
				className="select-none"
				style={{ touchAction: "none" }}
			>
				<ReaderContent />
			</div>
		</div>
	);
}
