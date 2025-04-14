import React, { Suspense } from "react";
import { UploadImage } from "~/app/_components/forms/UploadImage";
import { Images } from "~/app/_components/Images";
import { HydrateClient } from "~/trpc/server";
import { auth } from "@clerk/nextjs/server";

async function Library() {
	const session = await auth();

	if (!session.userId) {
		return <>No images</>;
	}

	return (
		<HydrateClient>
			<UploadImage />
			<div className=" grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-2 p-2">
				<Suspense fallback={<>Loading...</>}>
					<Images />
				</Suspense>
			</div>
		</HydrateClient>
	);
}

export default Library;
