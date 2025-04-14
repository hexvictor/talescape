"use client";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import ModalBackdrop from "./ModalBackdrop";
import ModalWrapper from "./ModalWrapper";

type ModalProps = {
	children: React.ReactNode;
	fitContent?: boolean;
	rounded?: boolean;
	dismissOnEsc?: boolean;
	showCloseButton?: boolean;
	hasBackdrop?: boolean;
	blockInteraction?: boolean;
};

type ModalContextProps = {
	// exposed to user-defined children
	onDismiss?: () => void;
	onKeyDown?: (e: React.KeyboardEvent) => void;

	// used internally by Modal components (Backdrop, Content)
	dismissOnEsc?: boolean;
	hasBackdrop?: boolean;
	blockInteraction?: boolean;
	rounded?: boolean;
	showCloseButton?: boolean;
	fitContent?: boolean;
};

/* 🧠 1. Create the context at the top of the file */
const ModalContext = createContext<ModalContextProps | undefined>(undefined);

/* 🪄 2. Custom hook to access the context safely */
export const useModal = () => {
	const modalContext = useContext(ModalContext);
	if (!modalContext) throw new Error("useModal must be used within a <Modal>");
	return modalContext;
};

export default function Modal({
	children,
	fitContent = false,
	showCloseButton = true,
	rounded = true,
	hasBackdrop = true,
	dismissOnEsc = true,
	blockInteraction = true,
}: ModalProps) {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const onDismiss = useCallback(() => {
		router.back();
	}, [router]);

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") router.back();
		},
		[router],
	);

	if (!mounted) return null; // evita tentar usar `document` no SSR
	const modalRoot = document.getElementById("modal-root") ?? document.body;

	return createPortal(
		<ModalContext.Provider
			value={{
				onDismiss,
				onKeyDown,
				dismissOnEsc,
				fitContent,
				showCloseButton,
				rounded,
				hasBackdrop,
				blockInteraction,
			}}
		>
			<ModalBackdrop>
				<ModalWrapper>{children}</ModalWrapper>
			</ModalBackdrop>
		</ModalContext.Provider>,
		modalRoot,
	);
}
