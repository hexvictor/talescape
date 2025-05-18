// components/EntryPage.tsx

import type { FC } from "react";
import clsx from "clsx";

import type { BookEntry } from "~/lib/data";
import { TalePage } from "../TalePage";
import { ScrollIndicator } from "../ScrollIndicator";

interface EntryPageProps {
	entry: BookEntry;
}

const EntryPage: FC<EntryPageProps> = ({ entry }) => {
	const isCover = entry.type === "cover";

	return (
		<div
			id={`entry-${entry.id}`}
			className={clsx(
				"min-h-screen space-y-12",
				isCover
					? "relative bg-purple-900 text-white"
					: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8",
			)}
		>
			{/* Entry header */}
			<div
				className={clsx("text-center", isCover ? "mt-20 mb-16" : "mt-8 mb-12")}
			>
				{!isCover && (
					<div className="text-muted-foreground text-xs uppercase tracking-widest">
						{entry.type.replace(/_/g, " ")}
					</div>
				)}

				<h1 className={clsx("font-bold", isCover ? "text-5xl" : "text-3xl")}>
					{entry.title}
				</h1>

				{/* {!isCover && (
					<div className="text-muted-foreground text-sm italic">
						{entry.pages.length} page{entry.pages.length !== 1 ? "s" : ""}
					</div>
				)} */}
			</div>

			{/* Cover-specific: Scroll hint */}
			{isCover && <ScrollIndicator />}

			{/* All pages of the entry */}
			{entry.pages.map((page) => (
				<div
					id={`page-${page.id}`}
					key={page.id}
					className="scroll-target border-t pt-6"
				>
					<TalePage page={page} />
				</div>
			))}
		</div>
	);
};

export default EntryPage;
