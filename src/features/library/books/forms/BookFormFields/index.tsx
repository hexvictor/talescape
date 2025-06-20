// BookFormFields.tsx
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "~/components/ui/Form";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "~/components/ui/Select";
import type { UseFormReturn } from "react-hook-form";
import type { BookFormData } from "../../lib/bookFormSchema";
import { statusOptions, typeOptions } from "../../lib/bookConstants";
import Input from "~/components/ui/Input";
import Textarea from "~/components/ui/Textarea";

type Props = {
	form: UseFormReturn<BookFormData>;
};

export default function BookFormFields({ form }: Props) {
	return (
		<>
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
						<FormLabel htmlFor="coverImageUrl-input">Cover Image URL</FormLabel>
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
		</>
	);
}
