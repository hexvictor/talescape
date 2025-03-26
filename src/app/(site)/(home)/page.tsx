import Link from "next/link";

export const dynamic = "force-dynamic";

import { LatestImages } from "@/app/_components/Images";
import { auth } from "@/server/auth";
import { HydrateClient, api } from "@/trpc/server";
import { mockImages, type MockImage } from "@/utils/mockImages";
import Image from "next/image";
import { Page } from "../../_components/layout/Page";
import { db } from "@/server/db";

export default async function Home() {
	const hello = await api.image.hello({ text: "from tRPC" });
	const session = await auth();

	const images = await db.query.images.findMany();
	console.log(images);

	if (session?.user) {
		void api.image.getImages.prefetch();
	}

	return (
		<HydrateClient>
			<div className=" grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-2 p-2">
				<LatestImages />
				{/* {images.map((image) => {
					return (
						<div key={image.id} className="relative aspect-square w-full ">
							{image.name}
						</div>
					);
				})}
				{mockImages.map((image: MockImage) => {
					return (
						<div key={image.key} className="relative aspect-square w-full ">
							<Image
								src={image.url}
								alt={image.name}
								fill
								className="object-cover"
							/>
						</div>
					);
				})} */}
			</div>
			Talescape (work in progress)
		</HydrateClient>
	);
}
