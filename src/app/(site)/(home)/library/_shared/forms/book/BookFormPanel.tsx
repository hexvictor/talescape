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

type BookFormPanelProps = {
	mode: "create" | "edit";
	canManageOfficial?: boolean;
};

export default function BookFormPanel({
	mode,
	canManageOfficial = false,
}: BookFormPanelProps) {
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
							name="title"
							defaultValue={isCreate ? "" : "The Ember Index"}
							placeholder="The Ember Index"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="book-author">Author</Label>
						<Input
							id="book-author"
							name="authorName"
							defaultValue={isCreate ? "" : "N. Aurelian Vale"}
							placeholder="Author name"
						/>
					</div>

					<div className="grid gap-2">
						<Label>Status</Label>
						<Select
							name="status"
							defaultValue={isCreate ? "draft" : "published"}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Choose status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="published">Published</SelectItem>
								<SelectItem value="private">Private</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="grid gap-2">
					<Label>Visibility</Label>
					<Select
						name="visibility"
						defaultValue={isCreate ? "private" : "public"}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Choose visibility" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="private">Private</SelectItem>
							<SelectItem value="restricted">Restricted</SelectItem>
							<SelectItem value="public">Public</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-start gap-3 rounded-md border bg-muted/35 p-4 text-sm">
					<Input
						id="book-editable"
						type="checkbox"
						name="editable"
						className="mt-0.5 size-4"
						defaultChecked
					/>
					<span>
						<Label htmlFor="book-editable" className="block font-medium">
							Editable
						</Label>
						<span className="text-muted-foreground">
							Allow this book record to be edited later.
						</span>
					</span>
				</div>
			</div>

			<div className="grid gap-2">
				<Label htmlFor="book-description">Description</Label>
				<Textarea
					id="book-description"
					name="description"
					defaultValue={
						isCreate
							? ""
							: "A court archivist discovers every forbidden spell has been catalogued in her handwriting."
					}
					placeholder="A short shelf description for this book..."
				/>
			</div>

			{canManageOfficial ? (
				<div className="grid gap-3 rounded-md border bg-muted/35 p-4 sm:grid-cols-2">
					<div className="flex items-start gap-3 text-sm">
						<Input
							id="book-is-official"
							type="checkbox"
							name="isOfficial"
							className="mt-0.5 size-4"
							defaultChecked={!isCreate}
						/>
						<span>
							<Label htmlFor="book-is-official" className="block font-medium">
								Official
							</Label>
							<span className="text-muted-foreground">
								Published as an admin-owned canonical book.
							</span>
						</span>
					</div>
					<div className="flex items-start gap-3 text-sm">
						<Input
							id="book-is-verified"
							type="checkbox"
							name="isVerified"
							className="mt-0.5 size-4"
							defaultChecked={!isCreate}
						/>
						<span>
							<Label htmlFor="book-is-verified" className="block font-medium">
								Verified
							</Label>
							<span className="text-muted-foreground">
								Confirmed as a trusted library record.
							</span>
						</span>
					</div>
				</div>
			) : null}

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
