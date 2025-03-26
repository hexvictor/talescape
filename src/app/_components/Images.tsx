"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import Image from "next/image";

export function LatestImages() {
	const [images] = api.image.getImages.useSuspenseQuery();

	const utils = api.useUtils();
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");
	const createImage = api.image.create.useMutation({
		onSuccess: async () => {
			await utils.image.invalidate();
			setName("");
		},
	});

	return (
		<div className=" grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-2 p-2">
			{images.length > 0 ? (
				images.map((image) => {
					return (
						<div key={image.id} className="relative aspect-square w-full ">
							<Image
								src={image.url}
								alt={image.name}
								fill
								className="object-cover"
							/>
						</div>
					);
				})
			) : (
				<p>You have no images yet.</p>
			)}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					createImage.mutate({ name, url });
				}}
				className="flex flex-col gap-2"
			>
				<input
					type="text"
					placeholder="Title"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
				/>
				<input
					type="text"
					placeholder="Url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
				/>
				<button
					type="submit"
					className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
					disabled={createImage.isPending}
				>
					{createImage.isPending ? "Submitting..." : "Submit"}
				</button>
			</form>
		</div>
	);
}
