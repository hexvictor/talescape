"use client";

import { Feather } from "lucide-react";
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

type AuthorFormPanelProps = {
	mode: "create" | "edit";
	canManageOfficial?: boolean;
};

export default function AuthorFormPanel({
	mode,
	canManageOfficial = false,
}: AuthorFormPanelProps) {
	const isCreate = mode === "create";

	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-[9rem_1fr]">
				<div className="flex aspect-square items-center justify-center rounded-md border bg-secondary text-secondary-foreground">
					<Feather aria-hidden="true" className="size-8" />
				</div>

				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="author-full-name">Full name</Label>
						<Input
							id="author-full-name"
							name="fullName"
							defaultValue={isCreate ? "" : "N. Aurelian Vale"}
							placeholder="N. Aurelian Vale"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="author-first-name">First name</Label>
							<Input
								id="author-first-name"
								name="firstName"
								defaultValue={isCreate ? "" : "Aurelian"}
								placeholder="Aurelian"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="author-last-name">Last name</Label>
							<Input
								id="author-last-name"
								name="lastName"
								defaultValue={isCreate ? "" : "Vale"}
								placeholder="Vale"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-2">
				<Label htmlFor="author-biography">Biography</Label>
				<Textarea
					id="author-biography"
					name="biography"
					defaultValue={
						isCreate
							? ""
							: "Archivist, mythographer, and keeper of implausibly complete field notes."
					}
					placeholder="A short author biography..."
					className="min-h-32"
				/>
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
						id="author-editable"
						type="checkbox"
						name="editable"
						className="mt-0.5 size-4"
						defaultChecked
					/>
					<span>
						<Label htmlFor="author-editable" className="block font-medium">
							Editable
						</Label>
						<span className="text-muted-foreground">
							Allow this author record to be edited later.
						</span>
					</span>
				</div>
			</div>

			{canManageOfficial ? (
				<div className="grid gap-3 rounded-md border bg-muted/35 p-4 sm:grid-cols-2">
					<div className="flex items-start gap-3 text-sm">
						<Input
							id="author-is-official"
							type="checkbox"
							name="isOfficial"
							className="mt-0.5 size-4"
							defaultChecked={!isCreate}
						/>
						<span>
							<Label htmlFor="author-is-official" className="block font-medium">
								Official
							</Label>
							<span className="text-muted-foreground">
								Published as an admin-owned canonical author.
							</span>
						</span>
					</div>
					<div className="flex items-start gap-3 text-sm">
						<Input
							id="author-is-verified"
							type="checkbox"
							name="isVerified"
							className="mt-0.5 size-4"
							defaultChecked={!isCreate}
						/>
						<span>
							<Label htmlFor="author-is-verified" className="block font-medium">
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
					{isCreate ? "Create author" : "Save changes"}
				</Button>
			</DialogFooter>
		</div>
	);
}
