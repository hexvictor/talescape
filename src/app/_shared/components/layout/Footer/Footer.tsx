import pkg from "@package.json";
import { TalescapeLogo } from "~/app/_shared/components/brand/TalescapeLogo";

export default function Footer() {
	return (
		<footer className="border-[var(--comic-blue)] border-t-[3px] bg-card text-card-foreground">
			<div className="mx-auto flex min-h-24 w-full max-w-[90rem] flex-col items-center gap-3 px-5 py-5 text-center sm:flex-row sm:px-8 sm:text-left">
				<TalescapeLogo
					markClassName="h-20"
					tone="auto"
					wordmarkClassName="w-36 sm:w-44"
				/>
				<p className="font-serif italic">Every story is a way out.</p>
				<p className="font-black text-[10px] uppercase sm:ml-auto">
					© {new Date().getFullYear()} · v{pkg.version}
				</p>
			</div>
		</footer>
	);
}
