"use client";

import type { Fragment } from "~/server/db/data/tale-reader/types/tales";
import type {
	ImageFragmentData,
	TextFragmentData,
} from "~/server/db/types/tale-reader/fragment";
import type { SectionOrientation } from "~/server/db/types/tale-reader/section";

type ReaderFragmentProps = {
	fragment: Fragment;
	orientation: SectionOrientation;
};

export function ReaderFragment({ fragment, orientation }: ReaderFragmentProps) {
	const isHorizontal = orientation === "horizontal";

	if (fragment.type === "text") {
		const data = fragment.data as TextFragmentData;

		return (
			<div
				className={
					isHorizontal
						? "max-w-[min(88vw,42rem)] shrink-0 px-2 sm:px-4"
						: "w-full max-w-2xl px-6 sm:px-10"
				}
			>
				<p
					className={
						isHorizontal
							? "text-center text-sm leading-6 sm:text-base md:text-lg"
							: "text-center text-base leading-7 sm:text-lg md:text-xl"
					}
				>
					{data.content}
				</p>
			</div>
		);
	}

	if (fragment.type === "image") {
		const data = fragment.data as ImageFragmentData;

		return (
			<div
				className={
					isHorizontal
						? "flex shrink-0 items-center justify-center overflow-hidden"
						: "relative flex w-full items-center justify-center"
				}
			>
				<img
					src={data.url}
					alt={data.alt || "Tale fragment"}
					className={
						isHorizontal
							? "h-auto max-h-[58vh] w-auto max-w-[88vw] object-contain sm:max-h-[62vh] sm:max-w-[78vw] lg:max-h-[65vh]"
							: "h-auto max-h-[90vh] w-full object-contain px-0 sm:max-h-[75vh] sm:max-w-4xl sm:px-6 md:max-h-[70vh]"
					}
				/>
			</div>
		);
	}

	return null;
}

export default ReaderFragment;
