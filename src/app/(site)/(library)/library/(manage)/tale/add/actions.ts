"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	UnavailableTaleSelectionError,
	createTaleFromForm,
} from "~/server/db/data/library/mutations/createTale";

export async function createTaleAction(formData: FormData) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/sign-in");
	}

	const result = await createTaleFromForm(userId, formData).catch(
		(error: unknown) => {
			if (error instanceof UnavailableTaleSelectionError) {
				redirect("/library/tale/add?error=unavailable");
			}
			throw error;
		},
	);

	if (result.status === "missing-user") {
		redirect("/library/tale/add?error=missing-user");
	}

	revalidatePath("/library");
	redirect(`/studio/${result.taleId}`);
}
