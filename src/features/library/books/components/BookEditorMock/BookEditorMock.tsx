"use client";

import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import Input from "~/components/ui/input";
import Label from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import Textarea from "~/components/ui/textarea";

type BookEditorMockProps = {
	mode: "create" | "edit";
};

export default function BookEditorMock({ mode }: BookEditorMockProps) {
	const isCreate = mode === "create";

	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
				<div className="relative aspect-[3/4] overflow-hidden rounded-md border bg-secondary">
					<div className="absolute inset-x-4 bottom-4 rounded-md bg-background/80 p-3 text-sm shadow-sm backdrop-blur-sm">
						<p className="font-semibold">
							{isCreate ? "New cover" : "Cover draft"}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							Upload artwork later
						</p>
					</div>
				</div>

				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="book-title">Title</Label>
						<Input
							id="book-title"
							defaultValue={isCreate ? "" : "The Ember Index"}
							placeholder="The Ember Index"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="book-author">Author</Label>
						<Input
							id="book-author"
							defaultValue={isCreate ? "" : "N. Aurelian Vale"}
							placeholder="Author name"
						/>
					</div>

					<div className="grid gap-2">
						<Label>Status</Label>
						<Select defaultValue={isCreate ? "drafting" : "published"}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Choose status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="drafting">Drafting</SelectItem>
								<SelectItem value="planning">Planning</SelectItem>
								<SelectItem value="published">Published</SelectItem>
								<SelectItem value="private">Private</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="grid gap-2">
				<Label htmlFor="book-description">Description</Label>
				<Textarea
					id="book-description"
					defaultValue={
						isCreate
							? ""
							: "A court archivist discovers every forbidden spell has been catalogued in her handwriting."
					}
					placeholder="A short shelf description for this book..."
				/>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline">
					Cancel
				</Button>
				<Button type="button">
					{isCreate ? "Create book" : "Save changes"}
				</Button>
			</DialogFooter>
		</div>
	);
}
