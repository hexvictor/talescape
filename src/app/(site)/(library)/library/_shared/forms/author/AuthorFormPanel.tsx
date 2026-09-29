"use client";

import { Feather } from "lucide-react";
import { DialogFooter } from "~/components/overlay/dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
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
				<div className="flex aspect-square items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground shadow-[4px_4px_0_var(--comic-ink)]">
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
				<Checkbox
					name="editable"
					value="true"
					defaultSelected
					className="items-start border-secondary border-l-4 bg-muted/35 p-4"
				>
					<span>
						<span className="block font-medium">Editable</span>
						<span className="font-normal text-muted-foreground">
							Allow this author record to be edited later.
						</span>
					</span>
				</Checkbox>
			</div>

			{canManageOfficial ? (
				<div className="grid gap-3 border-primary border-l-4 bg-muted/35 p-4 sm:grid-cols-2">
					<Checkbox
						name="isOfficial"
						value="true"
						defaultSelected={!isCreate}
						className="items-start"
					>
						<span>
							<span className="block font-medium">Official</span>
							<span className="font-normal text-muted-foreground">
								Published as an admin-owned canonical author.
							</span>
						</span>
					</Checkbox>
					<Checkbox
						name="isVerified"
						value="true"
						defaultSelected={!isCreate}
						className="items-start"
					>
						<span>
							<span className="block font-medium">Verified</span>
							<span className="font-normal text-muted-foreground">
								Confirmed as a trusted library record.
							</span>
						</span>
					</Checkbox>
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
