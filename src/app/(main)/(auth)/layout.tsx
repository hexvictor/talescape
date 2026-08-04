import { AuthPageLinkHandler } from "~/features/auth/components";

export default function AuthLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <AuthPageLinkHandler>{children}</AuthPageLinkHandler>;
}
