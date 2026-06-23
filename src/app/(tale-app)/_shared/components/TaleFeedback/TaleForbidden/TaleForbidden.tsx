"use client";

import Link from "next/link";

type TaleForbiddenProps = {
	action?: "edit" | "view";
	slug: string;
	creatorUsername: string;
	visibility?: string;
	title?: string;
	type?: string;
	creator?: string;
};

export default function TaleForbidden({
	action = "view",
	slug,
	creatorUsername,
	visibility,
	title,
	type,
	creator,
}: TaleForbiddenProps): React.JSX.Element {
	return (
		<div
			data-reader-component="TaleForbidden"
			data-reader-role="feedback-screen"
			className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6 text-center text-foreground"
		>
			<h1 className="mb-2 font-bold text-2xl">
				{action === "edit" ? "Editing unavailable" : "Access forbidden"}
			</h1>

			{title ? (
				<>
					<p className="mb-1 text-lg italic">"{title}"</p>
					<p className="mb-4 text-gray-400 text-sm">
						This tale is <strong>{visibility}</strong> and you do not have
						permission to {action} it.
					</p>
				</>
			) : (
				<p className="mb-4 text-gray-400 text-sm">
					You do not have permission to {action} this tale.
				</p>
			)}

			<Link
				href="/"
				className="mt-4 text-blue-400 text-sm underline hover:text-blue-300"
			>
				Go back to homepage
			</Link>

			<div className="mt-6 text-xs opacity-40">
				<p>Slug: {slug}</p>
				<p>Creator ID: {creatorUsername}</p>
				{creator && <p>Owner: {creator}</p>}
				{type && <p>Type: {type}</p>}
			</div>
		</div>
	);
}
