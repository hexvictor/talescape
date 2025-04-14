import type React from "react";

type PageProps = {
	children: React.ReactNode;
	centered?: boolean;
};
export default function Page({
	children,
	centered = false,
}: PageProps): React.ReactNode {
	return (
		<main
			className={`flex-1 p-2 ${centered ? "flex items-center justify-center" : ""}`}
		>
			{children}
		</main>
	);
}
