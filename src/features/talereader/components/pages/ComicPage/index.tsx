// components/pageTypes/ComicPage.tsx

import type { Page } from "~/lib/data";
import type { FC, JSX } from "react";
import React from "react";

export interface ComicPageProps {
	page: Page;
}

function ComicPageComponent({ page }: ComicPageProps): JSX.Element {
	return (
		<div className="flex flex-col gap-4 bg-purple-50 p-6">
			<div className="text-purple-700 text-sm italic">
				Comic pages {page.firstPage}–{page.lastPage}
			</div>

			{page.fragments.map((fragment) => {
				if (fragment.type === "text") {
					return (
						<p
							key={fragment.id}
							className="font-mono text-base leading-relaxed"
						>
							{fragment.content}
						</p>
					);
				}

				if (fragment.type === "image") {
					return (
						<img
							key={fragment.id}
							src={fragment.content}
							alt="Comic panel"
							className="rounded-md shadow"
						/>
					);
				}

				return null;
			})}
		</div>
	);
}

const ComicPage = React.memo(ComicPageComponent);
export default ComicPage;
