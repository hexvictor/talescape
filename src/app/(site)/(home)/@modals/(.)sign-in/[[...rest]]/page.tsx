import { SignIn } from "@clerk/nextjs";
import Modal from "~/components/ui/modal";

export default function SignInModalPage() {
	return (
		<Modal fitContent>
			<SignIn
				path="/sign-in"
				routing="path"
				fallbackRedirectUrl="/"
				signUpFallbackRedirectUrl="/"
			/>
		</Modal>
	);
}
