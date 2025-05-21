"use client";
import { useBookForm } from "~/features/library/books/hooks/useBookForm";
import { BookFormFields } from "~/features/library/books/components";
import { Form } from "~/components/ui/Form";
import { Button } from "~/components/ui/Button";

export default function EditBookPage() {
	const { form, onSubmit } = useBookForm({ mode: "edit" });

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<BookFormFields form={form} />
			</form>
			<Button type="submit">Update book</Button>
		</Form>
	);
}
