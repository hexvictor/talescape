import cn from "~/lib/utils/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				"flex h-11 w-full min-w-0 border-2 border-input bg-card px-3 py-1 text-base shadow-[3px_3px_0_rgb(var(--foreground-rgb))] outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-bold file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40",
				"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		/>
	);
}

export default Input;
