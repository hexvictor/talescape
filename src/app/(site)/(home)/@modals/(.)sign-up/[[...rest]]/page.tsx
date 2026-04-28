import { SignUp } from "@clerk/nextjs";
import Modal from "~/components/ui/modal";

export default function SignUpModalPage() {
	return (
		<Modal fitContent>
			<SignUp
				path="/sign-up"
				routing="path"
				fallbackRedirectUrl="/"
				signInFallbackRedirectUrl="/"
			/>
		</Modal>
	);
}
