import { auth } from "@clerk/nextjs/server";

export async function getSignedInUserId() {
	try {
		const user = await auth();

		return user.userId;
	} catch {
		return null;
	}
}
