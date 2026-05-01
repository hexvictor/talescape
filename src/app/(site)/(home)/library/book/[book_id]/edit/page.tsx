import { Suspense } from "react";
import BookEditorMock from "~/features/library/books/components/BookEditorMock";
import { DetailPageSkeleton } from "../../../../_components/skeletons";

export default function EditBookPage() {
	// const { form, onSubmit } = useBookForm({ mode: "edit" });

	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<BookEditorMock mode="edit" />
		</Suspense>
	);
	// return (
	// 	<Form {...form}>
	// 		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
	// 			<BookFormFields form={form} />
	// 		</form>
	// 		<Button type="submit">Update book</Button>
	// 	</Form>
	// );
}
