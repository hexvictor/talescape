"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { RouteSheet } from "~/app/_components/layout/RouteSheet/RouteSheet";
import { Form } from "~/components/ui/Form";
import { useBookForm } from "~/features/books/hooks/useBookForm";
import { BookFormFields } from "~/features/books/components";
import { Button } from "~/components/ui/Button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/Card";

export default function AddBookSheet() {
	const router = useRouter();
	const { form, onSubmit } = useBookForm({
		mode: "create",
		onSuccess: () => {
			setOpen(false);
		},
		onError: () => {
			form.setError("root", {
				type: "manual",
				message: "Something went wrong while creating the book.",
			});
		},
	});
	const [open, setOpen] = useState(true);
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add new book</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						ref={formRef}
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<BookFormFields form={form} />
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<Button onClick={() => router.back()}>Cancel</Button>
				<Button type="button" onClick={() => formRef.current?.requestSubmit()}>
					Create book
				</Button>
			</CardFooter>
		</Card>
	);
}
