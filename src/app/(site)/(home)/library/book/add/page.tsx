"use client";
import React from "react";
import { BookForm } from "../_components/BookForm";
import type { BookFormData } from "~/lib/validators/bookFormSchema";

function AddBookPage() {
	const onSubmit = async (data: BookFormData) => {
		try {
			// Process the form data, e.g., send to an API
			console.log(data);
			// await createBook(data);
			// Optionally, navigate to another page or show a success message
		} catch (error) {
			// Handle any errors that occur during submission
			console.error("Submission error:", error);
		}
	};

	return (
		<div>
			<BookForm onSubmitAction={onSubmit} mode="create" />
		</div>
	);
}

export default AddBookPage;
