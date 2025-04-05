import { UploadImage } from "~/app/_components/forms/UploadImage";
import { Images } from "~/app/_components/Images";
import { HydrateClient } from "~/trpc/server";
import { Suspense } from "react";

export default function Home() {
	// if (session?.user) {
	// 	void api.image.getImages.prefetch();
	// }

	return (
		<HydrateClient>
			<UploadImage />
			<div className=" grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-2 p-2">
				<Suspense fallback={<>Loading...</>}>
					<Images />
				</Suspense>

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
