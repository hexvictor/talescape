"use client";
import {
	BookEntries,
	ContentsNavigator,
	EntryNavigator,
	PageNavigator,
	ReaderUiToggle,
	TaleProgress,
} from "~/features/talereader/components/reader";
import { TaleReaderProvider } from "~/features/talereader/contexts/TaleReaderContext";
import { useSearchParams } from "next/navigation";
import {
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/Button";

const pages = [
	{ id: 1, color: "bg-blue-200", label: "Page 1" },
	{ id: 2, color: "bg-green-200", label: "Page 2" },
	{ id: 3, color: "bg-red-200", label: "Page 3" },
	{ id: 4, color: "bg-yellow-200", label: "Page 4" },
];

function Pager() {
	const params = useSearchParams();
	const direction =
		params.get("direction") === "horizontal" ? "horizontal" : "vertical";
	const [index, setIndex] = useState(0);
	const [scrolling, setScrolling] = useState(false);

	const next = () => {
		if (index < pages.length - 1) setIndex((i) => i + 1);
	};

	const prev = () => {
		if (index > 0) setIndex((i) => i - 1);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (direction === "horizontal") {
				if (e.key === "ArrowRight") next();
				if (e.key === "ArrowLeft") prev();
			} else {
				if (e.key === "ArrowDown") next();
				if (e.key === "ArrowUp") prev();
			}
		};

		const handleWheel = (e: WheelEvent) => {
			if (scrolling) return;
			e.preventDefault();
			setScrolling(true);
			if (e.deltaY > 0) next();
			else prev();
			setTimeout(() => setScrolling(false), 500);
		};

		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("wheel", handleWheel);
		};
	}, [index, direction, scrolling]);

	return (
		<div className="relative h-screen w-screen overflow-hidden">
			<div
				className="flex transition-transform duration-500 ease-in-out"
				style={
					direction === "horizontal"
						? {
								transform: `translateX(-${index * 100}vw)`,
								width: `${pages.length * 100}vw`,
							}
						: {
								flexDirection: "column",
								transform: `translateY(-${index * 100}vh)`,
								height: `${pages.length * 100}vh`,
							}
				}
			>
				{pages.map((page) => (
					<div
						key={page.id}
						className={`${page.color} flex h-screen w-screen flex-shrink-0 items-center justify-center font-bold text-4xl`}
					>
						{page.label}
					</div>
				))}
			</div>

			{/* Navigation Arrows */}
			{direction === "horizontal" ? (
				<>
					<Button
						onClick={prev}
						className="-translate-y-1/2 absolute top-1/2 left-4 z-10"
						variant="ghost"
						size="icon"
					>
						<ChevronLeft className="h-8 w-8" />
					</Button>
					<Button
						onClick={next}
						className="-translate-y-1/2 absolute top-1/2 right-4 z-10"
						variant="ghost"
						size="icon"
					>
						<ChevronRight className="h-8 w-8" />
					</Button>
				</>
			) : (
				<>
					<Button
						onClick={prev}
						className="-translate-x-1/2 absolute top-4 left-1/2 z-10"
						variant="ghost"
						size="icon"
					>
						<ChevronUp className="h-8 w-8" />
					</Button>
					<Button
						onClick={next}
						className="-translate-x-1/2 absolute bottom-4 left-1/2 z-10"
						variant="ghost"
						size="icon"
					>
						<ChevronDown className="h-8 w-8" />
					</Button>
				</>
			)}
		</div>
	);
}

function StoryView() {
	return (
		<TaleReaderProvider>
			<Pager />
		</TaleReaderProvider>
	);
}

export default StoryView;
