"use client";

import { Eye, EyeIcon, EyeOff, EyeOffIcon } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

export function UiToggleButton() {
	const { uiVisible, toggleUI } = useTaleReaderStore();

	return (
		<Button
			variant={uiVisible ? "outline" : "secondary"}
			size="icon"
			className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg"
			onClick={() => toggleUI()}
			aria-label={uiVisible ? "Hide interface" : "Show interface"}
		>
			{uiVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
		</Button>
	);
}
