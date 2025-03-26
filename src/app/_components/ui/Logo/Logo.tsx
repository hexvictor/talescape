import Link from "next/link";
import React from "react";

export default function Logo() {
	return (
		<Link href="/">
			<span className="font-bold text-xl">Talescape</span>
		</Link>
	);
}
