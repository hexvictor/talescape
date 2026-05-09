"use client";

import RouteDialog from "~/components/layout/RouteDialog";
import BookEditorMock from "~/features/library/books/components/BookEditorMock";

export default function AddBookSheet() {
	return (
		<RouteDialog
			title="Add new book"
			description="Create a shelf entry, connect it to a codex, and keep the story world tidy."
			contentClassName="sm:max-w-2xl"
		>
			<BookEditorMock mode="create" />
		</RouteDialog>
	);
	// const router = useRouter();
	// const { form, onSubmit } = useBookForm({
	// 	mode: "create",
	// 	onSuccess: () => {
	// 		setOpen(false);
	// 	},
	// 	onError: () => {
	// 		form.setError("root", {
	// 			type: "manual",
	// 			message: "Something went wrong while creating the book.",
	// 		});
	// 	},
	// });
	// const [open, setOpen] = useState(true);
	// const formRef = useRef<HTMLFormElement>(null);

	// return (
	// 	<Card>
	// 		<CardHeader>
	// 			<CardTitle>Add new book</CardTitle>
	// 		</CardHeader>
	// 		<CardContent>
	// 			<Form {...form}>
	// 				<form
	// 					ref={formRef}
	// 					onSubmit={form.handleSubmit(onSubmit)}
	// 					className="space-y-4"
	// 				>
	// 					<BookFormFields form={form} />
	// 				</form>
	// 			</Form>
	// 		</CardContent>
	// 		<CardFooter>
	// 			<Button onClick={() => router.back()}>Cancel</Button>
	// 			<Button type="button" onClick={() => formRef.current?.requestSubmit()}>
	// 				Create book
	// 			</Button>
	// 		</CardFooter>
	// 	</Card>
	// );
}
