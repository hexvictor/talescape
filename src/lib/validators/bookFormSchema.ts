import { z } from "zod";

export const bookFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	authorId: z.number({ invalid_type_error: "Author is required" }),
	coverImageUrl: z.string().url().optional(),

	userId: z.string().optional(),

	type: z.enum(["official", "user"]),
	status: z.enum(["draft", "published", "private"]),
});

export type BookFormData = z.infer<typeof bookFormSchema>;
