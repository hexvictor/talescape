import Image from "next/image";
import { getMyImages } from "~/server/db/queries/images";

export async function Images() {
	const images = await getMyImages();

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
		</div>
	);
}
