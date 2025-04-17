import { version } from "@package.json";
export default function Footer() {
	return (
		<div className="flex min-h-10 items-center justify-center bg-black py-2 text-center text-gray-400 text-xs">
			© {new Date().getFullYear()} Talescape — v{version}
		</div>
	);
}
