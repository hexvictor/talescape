"use client";

import RouteDialog from "~/components/layout/RouteDialog";
import BookEditorMock from "~/features/library/books/components/BookEditorMock";

export default function EditBookSheet() {
	return (
		<RouteDialog
			title="Edit book"
			description="Tune the book metadata, status, cover, and connected world notes."
			contentClassName="sm:max-w-2xl"
		>
			<BookEditorMock mode="edit" />
		</RouteDialog>
	);
	// const router = useRouter();
	// const { form, onSubmit } = useBookForm({ mode: "edit" });

	// return (
	// 	<Card>
	// 		<CardHeader>
	// 			<CardTitle>Edit book</CardTitle>
	// 		</CardHeader>
	// 		<CardContent>
	// 			<Form {...form}>
	// 				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
	// 					<BookFormFields form={form} />
	// 				</form>
	// 			</Form>
	// 		</CardContent>
	// 		<CardFooter>
	// 			<Button onClick={() => router.back()}>Cancel</Button>
	// 			<Button type="submit">Update book</Button>
	// 		</CardFooter>
	// 	</Card>
	// );
}
