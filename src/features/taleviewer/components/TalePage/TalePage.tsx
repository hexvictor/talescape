// components/TalePage.tsx

import type { FC } from "react";
import type { Page } from "~/lib/data";

interface TalePageProps {
	page: Page;
}

const TalePage: FC<TalePageProps> = ({ page }) => {
	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="text-muted-foreground text-sm italic">
				Pages {page.firstPage}–{page.lastPage}
			</div>

			{page.fragments.map((fragment) => {
				if (fragment.type === "text") {
					return (
						<p key={fragment.id} className="text-base leading-relaxed">
							{fragment.content}
						</p>
					);
				}

				if (fragment.type === "image") {
					return (
						<img
							key={fragment.id}
							src={fragment.content}
							alt="Tale fragment"
							className="rounded-md"
						/>
					);
				}

				return null;
			})}
		</div>
	);
};

export default TalePage;
