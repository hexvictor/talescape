"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBookForm } from "~/features/library/books/hooks/useBookForm";
import { BookFormFields } from "~/features/library/books/components";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/Card";
import Link from "next/link";
import { Form } from "~/components/ui/Form";
import { Button } from "~/components/ui/Button";

export default function EditBookSheet() {
	const router = useRouter();
	const { form, onSubmit } = useBookForm({ mode: "edit" });

	return (
		<Card>
			<CardHeader>
				<CardTitle>Edit book</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<BookFormFields form={form} />
					</form>
				</Form>
			</CardContent>
			<CardFooter>
				<Button onClick={() => router.back()}>Cancel</Button>
				<Button type="submit">Update book</Button>
			</CardFooter>
		</Card>
	);
}
