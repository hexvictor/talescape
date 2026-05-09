import type { Appearance } from "@clerk/types";

export const clerkAppearance = {
	variables: {
		colorBackground: "var(--card)",
		colorDanger: "var(--destructive)",
		colorInputBackground: "var(--background)",
		colorInputText: "var(--foreground)",
		colorPrimary: "var(--primary)",
		colorText: "var(--foreground)",
		colorTextSecondary: "var(--muted-foreground)",
		borderRadius: "var(--radius)",
	},
	elements: {
		cardBox: {
			backgroundColor: "var(--card)",
			border: "1px solid var(--border)",
			borderRadius: "var(--radius)",
			boxShadow: "none",
			color: "var(--card-foreground)",
			overflow: "hidden",
		},
		card: {
			backgroundColor: "var(--card)",
			boxShadow: "none",
			color: "var(--card-foreground)",
		},
		headerTitle: "text-foreground",
		headerSubtitle: "text-muted-foreground",
		socialButtonsBlockButton: {
			backgroundColor: "#fffaf3",
			borderColor: "var(--border)",
			boxShadow: "0 1px 2px rgb(0 0 0 / 0.08)",
			color: "#1c1209",
			"&:hover": {
				backgroundColor: "#fff3e3",
			},
		},
		socialButtonsBlockButtonText: {
			color: "#1c1209",
			fontWeight: 600,
		},
		socialButtonsProviderIcon: "shrink-0",
		formButtonPrimary:
			"bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
		formFieldInput:
			"bg-background text-foreground border-input focus:border-ring focus:ring-ring",
		footerActionText: "text-muted-foreground",
		footerActionLink: "text-primary hover:text-primary/90",
		dividerLine: "bg-border",
		dividerText: "text-muted-foreground",
		identityPreviewText: "text-foreground",
		identityPreviewEditButton: "text-primary",
	},
} satisfies Appearance;
