import SiteNotFound from "~/app/(site)/not-found";
import Footer from "~/app/_shared/components/layout/Footer";
import { Header } from "~/app/_shared/components/layout/Header";

/** Renders the branded site shell for URLs that do not match any route group. */
export default function RootNotFound(): React.JSX.Element {
	return (
		<div className="site-paper flex min-h-dvh flex-col">
			<Header />
			<div className="flex-1">
				<SiteNotFound />
			</div>
			<Footer />
		</div>
	);
}
