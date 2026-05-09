import { Header } from "~/components/layout";
import { AuthPageLinkHandler } from "~/features/auth/components";

export default function AuthLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<Header />
			<main className="flex flex-1 items-center justify-center p-4">
				<AuthPageLinkHandler>{children}</AuthPageLinkHandler>
			</main>
		</>
	);
}
