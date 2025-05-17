import { Modal } from "~/components/ui/Modal";
import { SignedIn, SignIn, useAuth } from "@clerk/nextjs";

export default function SignInModalPage() {
	return (
		<Modal fitContent>
			<SignIn routing="hash" />
		</Modal>
	);
}
