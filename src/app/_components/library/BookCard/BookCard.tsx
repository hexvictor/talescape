import Image from "next/image";
import React from "react";
import type { BookWithAuthor } from "~/server/db/schema";
import type { BookProps } from "~/server/db/types/book";
import { toTitleCase } from "~/utils/string";

const BookCard = ({
	title,
	author,
	description,
	coverImageUrl,
	type,
	userId,
	status,
	createdAt,
	updatedAt,
}: BookWithAuthor) => {
	return (
		<div className="overflow-hidden rounded-lg border bg-white shadow transition-shadow hover:shadow-md">
			{coverImageUrl && (
				<div className="relative h-48 w-full">
					<Image
						src={coverImageUrl}
						alt={title}
						fill
						className="object-cover"
					/>
				</div>
			)}

			<div className="p-4">
				<h3 className="font-semibold text-lg">{title}</h3>
				<p className="mb-1 text-gray-500 text-sm">
					{author?.name ?? "Unknown Author"}
				</p>
				<p className="line-clamp-3 text-gray-700 text-sm">{description}</p>

				<div className="mt-4 flex justify-end text-gray-400 text-xs">
					<span>{toTitleCase(type)}</span>
				</div>
			</div>
		</div>
	);
};

export default BookCard;
