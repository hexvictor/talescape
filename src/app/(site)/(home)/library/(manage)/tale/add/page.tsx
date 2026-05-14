import {
	ArrowRight,
	BookOpen,
	GitBranch,
	Layers,
	Link2,
	Plus,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import Input from "~/components/ui/input";
import Textarea from "~/components/ui/textarea";
import { getTaleCreateOptions } from "~/server/db/data/library/queries";
import { createTaleAction } from "./actions";

type AddTalePageProps = {
	searchParams?: Promise<{
		error?: string;
	}>;
};

const fieldClass =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export default async function AddTalePage({ searchParams }: AddTalePageProps) {
	const [{ userId, books }, params] = await Promise.all([
		getTaleCreateOptions(),
		searchParams,
	]);

	if (!userId) {
		return (
			<div className="mx-auto w-full max-w-3xl rounded-md border bg-card p-6 shadow-sm">
				<p className="font-semibold text-primary text-sm uppercase tracking-normal">
					Create Tale
				</p>
				<h1 className="mt-2 text-balance font-bold text-3xl">
					Sign in to start a tale.
				</h1>
				<p className="mt-3 text-muted-foreground leading-7">
					Tales need an owner before their branches, sections, blocks, and
					fragments can be saved.
				</p>
				<Button asChild className="mt-5">
					<Link href="/sign-in">Sign in</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="mx-auto grid w-full max-w-7xl gap-5 py-2 lg:grid-cols-[1fr_24rem]">
			<form action={createTaleAction} className="grid gap-5">
				<section className="rounded-md border bg-card p-5 shadow-sm sm:p-6">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
						<div>
							<p className="font-semibold text-primary text-sm uppercase tracking-normal">
								Create Tale
							</p>
							<h1 className="mt-2 text-balance font-bold text-3xl">
								Start with a complete readable structure.
							</h1>
						</div>
						<Button type="submit">
							<Plus aria-hidden="true" />
							Create Tale
						</Button>
					</div>
					{params?.error === "missing-user" ? (
						<p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm">
							Your signed-in Clerk user is not seeded in Talescape yet.
						</p>
					) : null}
				</section>

				<section className="grid gap-4 rounded-md border bg-card p-5 shadow-sm sm:p-6">
					<SectionTitle
						icon={<BookOpen aria-hidden="true" className="size-4" />}
						label="Tale"
						title="Identity"
					/>
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="Title" htmlFor="title">
							<Input
								id="title"
								name="title"
								required
								defaultValue="New Talescape Draft"
							/>
						</Field>
						<Field label="Book" htmlFor="bookId">
							<select id="bookId" name="bookId" className={fieldClass}>
								<option value="none">No book</option>
								{books.map((book) => (
									<option key={book.id} value={book.id}>
										{book.title}
										{book.author?.fullName ? ` - ${book.author.fullName}` : ""}
									</option>
								))}
							</select>
						</Field>
						<Field label="Type" htmlFor="type">
							<select id="type" name="type" className={fieldClass}>
								<option value="story">Story</option>
								<option value="codex">Codex</option>
								<option value="timeline">Timeline</option>
							</select>
						</Field>
						<Field label="Visibility" htmlFor="visibility">
							<select id="visibility" name="visibility" className={fieldClass}>
								<option value="private">Private</option>
								<option value="restricted">Restricted</option>
								<option value="public">Public</option>
							</select>
						</Field>
						<Field label="Status" htmlFor="status">
							<select id="status" name="status" className={fieldClass}>
								<option value="draft">Draft</option>
								<option value="review">Review</option>
								<option value="published">Published</option>
							</select>
						</Field>
					</div>
					<Field label="Description" htmlFor="description">
						<Textarea
							id="description"
							name="description"
							required
							defaultValue="A newly drafted interactive tale."
							className="min-h-24"
						/>
					</Field>
				</section>

				<section className="grid gap-4 rounded-md border bg-card p-5 shadow-sm sm:p-6">
					<SectionTitle
						icon={<BookOpen aria-hidden="true" className="size-4" />}
						label="Parts > Entries > Pages"
						title="Narrative spine"
					/>
					<div className="grid gap-4 md:grid-cols-3">
						<Field label="Part title" htmlFor="partTitle">
							<Input id="partTitle" name="partTitle" defaultValue="Part 1" />
						</Field>
						<Field label="Entry title" htmlFor="entryTitle">
							<Input id="entryTitle" name="entryTitle" defaultValue="Opening" />
						</Field>
						<Field label="Pages" htmlFor="pageCount">
							<Input
								id="pageCount"
								name="pageCount"
								type="number"
								min={1}
								max={12}
								defaultValue={3}
							/>
						</Field>
					</div>
				</section>

				<section className="grid gap-4 rounded-md border bg-card p-5 shadow-sm sm:p-6">
					<SectionTitle
						icon={<GitBranch aria-hidden="true" className="size-4" />}
						label="Branches > Sections > Blocks > Fragments"
						title="Reader path"
					/>
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="Branch mode" htmlFor="branchMode">
							<select id="branchMode" name="branchMode" className={fieldClass}>
								<option value="linear">Linear</option>
								<option value="branching">Branching</option>
							</select>
						</Field>
						<Field label="Blocks per branch" htmlFor="blocksPerBranch">
							<Input
								id="blocksPerBranch"
								name="blocksPerBranch"
								type="number"
								min={1}
								max={12}
								defaultValue={3}
							/>
						</Field>
						<Field label="Main branch" htmlFor="mainBranchName">
							<Input
								id="mainBranchName"
								name="mainBranchName"
								defaultValue="Main"
							/>
						</Field>
						<Field label="Choice branch" htmlFor="choiceBranchName">
							<Input
								id="choiceBranchName"
								name="choiceBranchName"
								defaultValue="Choice Path"
							/>
						</Field>
						<Field label="Path label" htmlFor="pathLabel">
							<Input
								id="pathLabel"
								name="pathLabel"
								defaultValue="Choose another route"
							/>
						</Field>
						<Field label="Orientation" htmlFor="orientation">
							<select
								id="orientation"
								name="orientation"
								className={fieldClass}
							>
								<option value="vertical">Vertical</option>
								<option value="horizontal">Horizontal</option>
							</select>
						</Field>
						<Field label="Direction" htmlFor="direction">
							<select id="direction" name="direction" className={fieldClass}>
								<option value="down">Down</option>
								<option value="right">Right</option>
								<option value="up">Up</option>
								<option value="left">Left</option>
							</select>
						</Field>
					</div>
					<Field label="Starter fragment text" htmlFor="starterText">
						<Textarea
							id="starterText"
							name="starterText"
							defaultValue="Draft beat {block}: begin writing this moment."
							className="min-h-24"
						/>
					</Field>
				</section>
			</form>

			<aside className="grid gap-5 self-start lg:sticky lg:top-20">
				<StructurePreview />
				<div className="rounded-md border bg-card p-5 shadow-sm">
					<h2 className="font-semibold text-lg">After save</h2>
					<div className="mt-4 grid gap-3 text-sm">
						<PreviewStep
							icon={<Link2 className="size-4" />}
							text="Pages are linked to blocks in order."
						/>
						<PreviewStep
							icon={<Layers className="size-4" />}
							text="Every block receives one text fragment."
						/>
						<PreviewStep
							icon={<ArrowRight className="size-4" />}
							text="Branching mode creates the first path."
						/>
					</div>
				</div>
			</aside>
		</div>
	);
}

function SectionTitle({
	icon,
	label,
	title,
}: {
	icon: ReactNode;
	label: string;
	title: string;
}) {
	return (
		<div>
			<p className="flex items-center gap-2 font-semibold text-primary text-sm uppercase tracking-normal">
				{icon}
				{label}
			</p>
			<h2 className="mt-2 font-semibold text-2xl">{title}</h2>
		</div>
	);
}

function Field({
	label,
	htmlFor,
	children,
}: {
	label: string;
	htmlFor: string;
	children: ReactNode;
}) {
	return (
		<div className="grid gap-2">
			<label htmlFor={htmlFor} className="font-medium text-sm">
				{label}
			</label>
			{children}
		</div>
	);
}

function StructurePreview() {
	return (
		<section className="rounded-md border bg-card p-5 shadow-sm">
			<h2 className="font-semibold text-lg">Structure preview</h2>
			<div className="mt-4 grid gap-4">
				<div className="rounded-md bg-muted p-4">
					<p className="font-semibold text-sm">Reader path</p>
					<div className="mt-3 grid gap-2 text-sm">
						<PreviewStep text="Branch" />
						<PreviewStep text="Section" />
						<PreviewStep text="Blocks" />
						<PreviewStep text="Fragments" />
					</div>
				</div>
				<div className="rounded-md bg-muted p-4">
					<p className="font-semibold text-sm">Narrative spine</p>
					<div className="mt-3 grid gap-2 text-sm">
						<PreviewStep text="Part" />
						<PreviewStep text="Entry" />
						<PreviewStep text="Pages" />
						<PreviewStep text="Block links" />
					</div>
				</div>
			</div>
		</section>
	);
}

function PreviewStep({
	icon,
	text,
}: {
	icon?: ReactNode;
	text: string;
}) {
	return (
		<div className="flex items-center gap-2 rounded-md bg-background px-3 py-2">
			<span className="flex size-6 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
				{icon ?? <ArrowRight aria-hidden="true" className="size-3.5" />}
			</span>
			<span>{text}</span>
		</div>
	);
}
