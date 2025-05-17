"use client";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "~/components/ui/Sheet";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RouteSheet } from "~/app/_components/layout/RouteSheet/RouteSheet";
import { Form } from "~/components/ui/Form";
import { useBookForm } from "~/features/books/hooks/useBookForm";
import { BookFormFields } from "~/features/books/components";
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
