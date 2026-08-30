import cn from "~/lib/utils/cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"field-sizing-content flex min-h-20 w-full border-2 border-input bg-card px-3 py-2 text-base shadow-[3px_3px_0_rgb(var(--foreground-rgb))] outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export default Textarea;
