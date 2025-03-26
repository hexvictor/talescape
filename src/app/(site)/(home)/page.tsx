import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { HydrateClient, api } from "@/trpc/server";
import { mockImages, type MockImage } from "@/utils/mockImages";
import Image from "next/image";
import { Page } from "../../_components/layout/Page";

export default async function Home() {
	const hello = await api.post.hello({ text: "from tRPC" });
	const session = await auth();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<div className=" grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-2 p-2">
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
				})}
			</div>
			Talescape (work in progress)
		</HydrateClient>
	);
}
