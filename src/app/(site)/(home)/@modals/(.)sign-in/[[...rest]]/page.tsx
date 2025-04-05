import { RouteModal } from "~/app/_components/ui/RouteModal";
import { SignedIn, SignIn, useAuth } from "@clerk/nextjs";

export default function LoginModalPage() {
	return (
		<RouteModal minimal>
			<SignIn routing="hash" />
		</RouteModal>
	);
}
