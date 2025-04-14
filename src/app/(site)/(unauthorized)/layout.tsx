import { Header } from "~/app/_components/layout/Header";
import { Page } from "~/app/_components/layout/Page";
import "~/styles/globals.css";

export default function LoginLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<Header />
			<Page centered>{children}</Page>
		</>
	);
}
