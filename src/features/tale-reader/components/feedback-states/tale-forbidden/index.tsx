"use client";

import Link from "next/link";

type TaleForbiddenProps = {
	slug: string;
	creatorUsername: string;
	visibility?: string;
	title?: string;
	type?: string;
	creator?: string;
};

export default function TaleForbidden({
	slug,
	creatorUsername,
	visibility,
	title,
	type,
	creator,
}: TaleForbiddenProps) {
	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6 text-center text-white">
			<h1 className="mb-2 font-bold text-2xl">Access Forbidden</h1>

			{title ? (
				<>
					<p className="mb-1 text-lg italic">"{title}"</p>
					<p className="mb-4 text-gray-400 text-sm">
						This tale is <strong>{visibility}</strong> and you do not have
						permission to view it.
					</p>
				</>
			) : (
				<p className="mb-4 text-gray-400 text-sm">
					You don’t have permission to view this tale.
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
