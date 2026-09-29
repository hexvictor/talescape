import pkg from "@package.json";
import { TalescapeLogo } from "~/app/_shared/components/brand/TalescapeLogo";

export default function Footer() {
	return (
		<footer
			data-reader-component="Footer"
			data-reader-role="site-footer"
			className="border-[var(--comic-blue)] border-t-[3px] bg-[var(--comic-ink)] text-white"
		>
			<div className="mx-auto flex min-h-24 w-full max-w-[var(--ts-content-max)] flex-col items-center gap-3 px-[var(--ts-page-gutter)] py-5 text-center sm:flex-row sm:text-left">
				<TalescapeLogo
					markClassName="h-20"
					tone="dark-surface"
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
