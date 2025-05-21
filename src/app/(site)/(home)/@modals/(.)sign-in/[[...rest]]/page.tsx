import { SignedIn, SignIn, useAuth } from "@clerk/nextjs";
import Modal from "~/components/ui/Modal";

export default function SignInModalPage() {
	return (
		<Modal fitContent>
			<SignIn routing="hash" />
		</Modal>
	);
}
