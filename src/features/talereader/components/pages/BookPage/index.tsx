import type { Page } from "~/lib/data";
import type { FC, JSX } from "react";
import React from "react";

export interface BookPageProps {
	page: Page;
}

function BookPageComponent({ page }: BookPageProps): JSX.Element {
	return (
		<div className=" flex min-h-[500px] flex-col gap-4 p-6">
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
}
const BookPage = React.memo(BookPageComponent);
export default BookPage;
