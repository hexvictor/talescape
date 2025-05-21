"use client";
import { useBookForm } from "~/features/library/books/hooks/useBookForm";
import { BookFormFields } from "~/features/library/books/components";
import { Form } from "~/components/ui/Form";
import { Button } from "~/components/ui/Button";

export default function AddBookPage() {
	const { form, onSubmit } = useBookForm({ mode: "create" });

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<BookFormFields form={form} />
			</form>
			<Button type="submit">Create book</Button>
		</Form>
	);
}
