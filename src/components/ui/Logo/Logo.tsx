import Link from "next/link";
import { BookOpenIcon, FlameIcon } from "~/lib/utils/icons";

export default function Logo() {
	return (
		<Link
			href="/"
			className="group inline-flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<span className="group-hover:-translate-y-0.5 relative grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform duration-200">
				<BookOpenIcon className="size-5" aria-hidden="true" />
				<FlameIcon
					className="-right-1 -top-1 absolute size-3.5 rounded-full bg-accent p-0.5 text-accent-foreground"
					aria-hidden="true"
				/>
			</span>
			<span className="font-bold text-xl tracking-normal">Talescape</span>
		</Link>
	);
}
