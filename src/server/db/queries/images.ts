import "server-only";
import { db } from "../";
import type { string } from "zod";
import { images } from "../schema";
import { auth } from "@clerk/nextjs/server";

export async function getMyImages() {
	const user = await auth();

	if (!user.userId) throw new Error("Unauthorized");
	const images = await db.query.images.findMany({
		where: (model, { eq }) => eq(model.userId, user.userId),
		orderBy: (model, { desc }) => desc(model.id),
	});
	return images;
}

export async function getImageById(id: number) {
	const user = await auth();

	if (!user.userId) throw new Error("Unauthorized");

	const image = await db.query.images.findFirst({
		where: (model, { eq }) => eq(model.id, id),
	});
	if (!image) throw new Error("Image not found");

	if (image.userId !== user.userId) throw new Error("Unauthorized");
	return image;
}

type addImageProps = {
	name: string;
	url: string;
	userId: string;
};

export async function addImage({
	name,
	url,
	userId,
}: addImageProps): Promise<void> {
	await db.insert(images).values({
		name,
		url,
		userId,
	});
}
