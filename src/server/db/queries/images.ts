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
