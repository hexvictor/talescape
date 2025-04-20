"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "~/components/ui/Input";
import { Textarea } from "~/components/ui/Textarea";
import { Button } from "~/components/ui/Button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/Form";
import {
	bookFormSchema,
	type BookFormData,
} from "~/lib/validators/bookFormSchema";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/Select";
import { statusOptions, typeOptions } from "~/lib/constants";

type BookFormProps = {
	defaultValues?: Partial<BookFormData>;
	onSubmitAction: (data: BookFormData) => Promise<void>;
	mode?: "create" | "edit";
};

export default function BookForm({
	defaultValues,
	onSubmitAction,
	mode = "create",
}: BookFormProps) {
	const form = useForm<BookFormData>({
		resolver: zodResolver(bookFormSchema),
		defaultValues: {
			title: "",
			description: "",
			authorId: 0,
			coverImageUrl: "",
			...defaultValues,
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmitAction)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="title-input">Title</FormLabel>
							<FormControl>
								<Input id="title-input" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="description-input">Description</FormLabel>
							<FormControl>
								<Textarea id="description-input" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="authorId"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="authorId-input">Author ID</FormLabel>
							<FormControl>
								<Input
									id="authorId-input"
									type="number"
									{...field}
									onChange={(e) => field.onChange(Number(e.target.value))}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="coverImageUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="coverImageUrl-input">
								Cover Image URL
							</FormLabel>
							<FormControl>
								<Input id="coverImageUrl-input" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Type Select Field */}
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Type</FormLabel>
							<FormControl>
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{typeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Status Select Field */}
				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<FormControl>
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{statusOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">
					{mode === "edit" ? "Update Book" : "Create Book"}
				</Button>
			</form>
		</Form>
	);
}
