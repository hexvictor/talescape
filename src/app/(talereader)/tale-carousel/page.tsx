"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "~/components/ui/Carousel";

const verticalSlides = [
	{ id: 1, label: "Vertical Slide 1", color: "bg-blue-300" },
	{ id: 2, label: "Nested Carousel", color: "bg-white" },
	{ id: 3, label: "Vertical Slide 3", color: "bg-green-300" },
	{ id: 4, label: "Vertical Slide 4", color: "bg-red-300" },
];

const horizontalSlides = [
	{ id: "a", label: "Nested Slide A", color: "bg-yellow-300" },
	{ id: "b", label: "Nested Slide B", color: "bg-pink-300" },
	{ id: "c", label: "Nested Slide C", color: "bg-purple-300" },
];

export default function NestedCarousel() {
	const [outerApi, setOuterApi] = useState<CarouselApi>();
	const [innerApi, setInnerApi] = useState<CarouselApi>();

	const [outerIndex, setOuterIndex] = useState(0);
	const [outerCount, setOuterCount] = useState(0);

	const [innerIndex, setInnerIndex] = useState(0);
	const [innerCount, setInnerCount] = useState(0);

	useEffect(() => {
		if (!outerApi) return;
		setOuterCount(outerApi.scrollSnapList().length);
		setOuterIndex(outerApi.selectedScrollSnap());
		outerApi.on("select", () => {
			setOuterIndex(outerApi.selectedScrollSnap());
		});
	}, [outerApi]);

	useEffect(() => {
		if (!innerApi) return;
		setInnerCount(innerApi.scrollSnapList().length);
		setInnerIndex(innerApi.selectedScrollSnap());
		innerApi.on("select", () => {
			setInnerIndex(innerApi.selectedScrollSnap());
		});
	}, [innerApi]);

	const isNested = outerIndex === 1;

	const showOuterPrev =
		(!isNested && outerIndex > 0) || (isNested && innerIndex === 0);
	const showOuterNext =
		(!isNested && outerIndex < outerCount - 1) ||
		(isNested && innerIndex === innerCount - 1);

	const showInnerPrev = isNested && innerIndex > 0;
	const showInnerNext = isNested && innerIndex < innerCount - 1;

	const nextOuter = () => outerApi?.scrollNext();
	const prevOuter = () => outerApi?.scrollPrev();
	const nextInner = () => innerApi?.scrollNext();
	const prevInner = () => innerApi?.scrollPrev();

	return (
		<div className="relative h-screen w-screen overflow-hidden">
			<Carousel
				orientation="vertical"
				setApi={setOuterApi}
				className="h-full w-full"
				opts={{ align: "start", watchDrag: false }}
			>
				<CarouselContent className="m-0 h-screen flex-col p-0">
					{verticalSlides.map((slide) =>
						slide.id === 2 ? (
							<CarouselItem
								key={slide.id}
								className="m-0 h-screen w-screen shrink-0 grow-0 basis-full p-0"
							>
								<Carousel
									orientation="horizontal"
									setApi={setInnerApi}
									opts={{ align: "start", watchDrag: false }}
									className="h-screen w-screen"
								>
									<CarouselContent className="m-0">
										{horizontalSlides.map((hSlide) => (
											<CarouselItem
												key={hSlide.id}
												className="h-screen w-screen shrink-0 grow-0 basis-full p-0"
											>
												<div
													className={`${hSlide.color} flex h-screen w-screen items-center justify-center font-bold text-4xl`}
												>
													{hSlide.label}
												</div>
											</CarouselItem>
										))}
									</CarouselContent>

									{/* Inner Nav Buttons */}
									<div className="absolute top-0 left-0 h-screen w-screen">
										{showInnerPrev && (
											<Button
												onClick={prevInner}
												className="-translate-y-1/2 absolute top-1/2 left-4 z-20"
												variant="secondary"
											>
												←
											</Button>
										)}
										{showInnerNext && (
											<Button
												onClick={nextInner}
												className="-translate-y-1/2 absolute top-1/2 right-4 z-20"
												variant="secondary"
											>
												→
											</Button>
										)}
									</div>
								</Carousel>
							</CarouselItem>
						) : (
							<CarouselItem
								key={slide.id}
								className="m-0 h-screen w-screen shrink-0 grow-0 basis-full p-0"
							>
								<div
									className={`${slide.color} flex h-full w-full items-center justify-center font-bold text-4xl`}
								>
									{slide.label}
								</div>
							</CarouselItem>
						),
					)}
				</CarouselContent>

				{/* Outer Nav Buttons */}
				{showOuterPrev && (
					<Button
						onClick={prevOuter}
						className="-translate-x-1/2 fixed top-4 left-1/2 z-30"
						variant="outline"
					>
						↑
					</Button>
				)}
				{showOuterNext && (
					<Button
						onClick={nextOuter}
						className="-translate-x-1/2 fixed bottom-4 left-1/2 z-30"
						variant="outline"
					>
						↓
					</Button>
				)}
			</Carousel>
		</div>
	);
}
