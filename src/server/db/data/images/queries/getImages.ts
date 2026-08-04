import "server-only";
import { db } from "../../..";
import { images } from "../../../schema";

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
