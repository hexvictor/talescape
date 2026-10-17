"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "~/components/ui/button";
import { ComboBox, type ComboBoxOption } from "~/components/ui/combobox";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import Textarea from "~/components/ui/textarea";

export function TaleCreationForm({
	action,
	books,
	authors,
	error,
}: {
	action: (data: FormData) => void | Promise<void>;
	books: ComboBoxOption[];
	authors: ComboBoxOption[];
	error?: string;
}) {
	const [book, setBook] = useState<string | null>(null);
	const [author, setAuthor] = useState<string | null>(null);
	const [newBook, setNewBook] = useState(false);
	const [newAuthor, setNewAuthor] = useState(false);
	return (
		<form
			action={action}
			data-reader-component="TaleCreationForm"
			data-reader-role="creation-form"
			className="grid gap-5"
		>
			{error && (
				<p role="alert" className="text-destructive">
					{error === "missing-user"
						? "Your account is not ready yet. Please sign in again."
						: "The selected book or author is unavailable. Choose another or create one."}
				</p>
			)}
			<Field label="Title">
				<Input
					name="title"
					aria-label="Title"
					required
					placeholder="Your tale's title"
					maxLength={200}
				/>
			</Field>
			<Field label="Description">
				<Textarea
					name="description"
					aria-label="Description"
					placeholder="What is your tale about?"
					rows={4}
				/>
			</Field>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Visibility">
					<Select
						name="visibility"
						defaultValue="private"
						aria-label="Visibility"
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="private">Only me</SelectItem>
							<SelectItem value="restricted">People I invite</SelectItem>
							<SelectItem value="public">Everyone</SelectItem>
						</SelectContent>
					</Select>
				</Field>
				<Field label="Type">
					<Select name="type" defaultValue="story" aria-label="Type">
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="story">Story</SelectItem>
							<SelectItem value="codex">Codex</SelectItem>
							<SelectItem value="timeline">Timeline</SelectItem>
						</SelectContent>
					</Select>
				</Field>
			</div>
			<fieldset className="grid gap-3 border-border border-t pt-4">
				<legend className="font-bold text-sm">Book (optional)</legend>
				{newBook ? (
					<Field label="New book title">
						<Input name="newBookTitle" aria-label="New book title" required />
					</Field>
				) : (
					<>
						<ComboBox
							label="Book"
							options={books}
							value={book}
							onChange={(key) => setBook(key === null ? null : String(key))}
							placeholder="Find a book"
						/>
						<input type="hidden" name="bookId" value={book ?? "none"} />
					</>
				)}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => {
						setNewBook(!newBook);
						setBook(null);
					}}
				>
					<Plus />
					{newBook ? "Choose an existing book" : "Create a new book"}
				</Button>
				{newBook && (
					<>
						{newAuthor ? (
							<Field label="New author name">
								<Input
									name="newAuthorName"
									aria-label="New author name"
									required
								/>
							</Field>
						) : (
							<>
								<ComboBox
									label="Author (optional)"
									options={authors}
									value={author}
									onChange={(key) =>
										setAuthor(key === null ? null : String(key))
									}
									placeholder="Find an author"
								/>
								<input type="hidden" name="authorId" value={author ?? "none"} />
							</>
						)}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setNewAuthor(!newAuthor);
								setAuthor(null);
							}}
						>
							<Plus />
							{newAuthor ? "Choose an existing author" : "Create a new author"}
						</Button>
					</>
				)}
			</fieldset>
			<CreateTaleButton />
		</form>
	);
}

function CreateTaleButton() {
	const { pending } = useFormStatus();
	return (
		<Button
			type="submit"
			disabled={pending}
			aria-busy={pending}
			shapes="slant-right"
			className="justify-self-start"
		>
			{pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
			{pending ? "Creating tale" : "Create tale"}
		</Button>
	);
}
