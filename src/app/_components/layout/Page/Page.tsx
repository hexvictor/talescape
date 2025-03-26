import type React from "react";

type PageProps = {
	children: React.ReactNode;
};
export default function Page({ children }: PageProps): React.ReactNode {
	return <main className="flex-1 p-2">{children}</main>;
}
