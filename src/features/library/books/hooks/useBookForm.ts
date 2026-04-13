import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookFormSchema, type BookFormData } from "../utils/bookFormSchema";

type UseBookFormProps = {
	defaultValues?: Partial<BookFormData>;
	mode?: "create" | "edit";
	onSuccess?: () => void;
	onError?: () => void;
};

export const useBookForm = ({
	defaultValues,
	mode = "create",
	onSuccess,
	onError,
}: UseBookFormProps) => {
	const form = useForm<BookFormData>({
		resolver: zodResolver(bookFormSchema),
		defaultValues: {
			title: "",
			description: "",
			authorId: 0,
			coverImageUrl: "",
			type: undefined,
			status: undefined,
			...defaultValues,
		},
	});

	const onSubmitCreateBook = async (data: BookFormData) => {
		try {
			console.log("✅ Creating book:", data);

			// Simulate a test error
			throw new Error("Test error: failed to create book");
			// onSuccess?.();
			// await createBook(data)
		} catch (error) {
			console.error("❌ Error creating book:", error);
			onError?.();
		}
	};

	const onSubmitEditBook = async (data: BookFormData) => {
		try {
			console.log("✏️ Editing book:", data);
			onSuccess?.();
			// await updateBook(data)
		} catch (error) {
			console.error("❌ Error editing book:", error);
			onError?.();
		}
	};

	const onSubmit = mode === "edit" ? onSubmitEditBook : onSubmitCreateBook;

	return {
		form,
		onSubmit,
	};
};
