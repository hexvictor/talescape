import pkg from "@package.json";

export default function Footer() {
	return (
		<footer className="border-border/70 border-t bg-card/70 text-muted-foreground">
			<div className="mx-auto flex min-h-12 w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-center text-xs sm:flex-row sm:px-6">
				<p>© {new Date().getFullYear()} Talescape</p>
				<p>v{pkg.version}</p>
			</div>
		</footer>
	);
}
