"use client";

import { useForm } from "react-hook-form";
import {
	bookFormSchema,
	type BookFormData,
} from "~/lib/validators/bookFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
type BookFormProps = {
	defaultValues?: Partial<BookFormData>;
	onSubmitAction: (data: BookFormData) => void;
	mode?: "create" | "edit";
};

export default function BookForm({
	defaultValues,
	onSubmitAction,
	mode = "create",
}: BookFormProps) {
	const { user } = useUser();

	console.log(user);
	const initialValues: BookFormData = {
		title: "",
		authorId: 0,
		description: "",
		coverImageUrl: "",
		type: "user",
		status: "draft",
		userId: undefined,
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<BookFormData>({
		resolver: zodResolver(bookFormSchema),
		defaultValues: defaultValues ?? initialValues,
	});

	return (
		<form onSubmit={handleSubmit(onSubmitAction)} className="space-y-4">
			<div>
				<label htmlFor="title-input">Title</label>
				<input {...register("title")} id="title-input" className="input" />
				{errors.title && <p className="text-red-500">{errors.title.message}</p>}
			</div>

			<div>
				<label htmlFor="description-input">Description</label>
				<textarea
					{...register("description")}
					id="description-input"
					className="input"
				/>
			</div>

			<div>
				<label htmlFor="authorId-input">Author ID</label>
				<input
					type="number"
					{...register("authorId", { valueAsNumber: true })}
					id="authorId-input"
					className="input"
				/>
				{errors.authorId && (
					<p className="text-red-500">{errors.authorId.message}</p>
				)}
			</div>

			<div>
				<label htmlFor="coverImageUrl-input">Cover Image URL</label>
				<input
					{...register("coverImageUrl")}
					id="coverImageUrl-input"
					className="input"
				/>
			</div>

			<button type="submit" className="btn">
				{mode === "edit" ? "Update Book" : "Create Book"}
			</button>
		</form>
	);
}
