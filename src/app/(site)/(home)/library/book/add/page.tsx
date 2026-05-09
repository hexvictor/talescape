import { Suspense } from "react";
import BookEditorMock from "~/features/library/books/components/BookEditorMock";
import { DetailPageSkeleton } from "../../../_components/skeletons";

export default function AddBookPage() {
	// const { form, onSubmit } = useBookForm({ mode: "create" });

	return (
		<Suspense fallback={<DetailPageSkeleton />}>
			<BookEditorMock mode="create" />
		</Suspense>
	);
	// return (
	// 	<Form {...form}>
	// 		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
	// 			<BookFormFields form={form} />
	// 		</form>
	// 		<Button type="submit">Create book</Button>
	// 	</Form>
	// );
}
