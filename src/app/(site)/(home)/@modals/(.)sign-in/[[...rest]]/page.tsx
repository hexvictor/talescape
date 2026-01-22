import { SignedIn, SignIn, useAuth } from "@clerk/nextjs";
import Modal from "~/components/ui/modal/Modal";

export default function SignInModalPage() {
  return (
    <Modal fitContent>
      <SignIn routing="hash" />
    </Modal>
  );
}
