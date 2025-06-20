"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useBookForm } from "~/features/library/books/hooks/useBookForm";
import { BookFormFields } from "~/features/library/books/components";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/Card";
import { Form } from "~/components/ui/Form";
import { Button } from "~/components/ui/Button";

export default function AddBookSheet() {
  return null;
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
