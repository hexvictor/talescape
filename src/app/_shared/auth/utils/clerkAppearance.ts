import type { ClerkProvider } from "@clerk/nextjs";

type Appearance = NonNullable<
	Parameters<typeof ClerkProvider>[0]["appearance"]
>;

export const clerkAppearance = {
	variables: {
		colorBackground: "transparent",
		colorDanger: "var(--destructive)",
		colorInputBackground: "var(--background)",
		colorInputText: "var(--foreground)",
		colorPrimary: "var(--primary)",
		colorText: "var(--foreground)",
		colorTextSecondary: "var(--muted-foreground)",
		borderRadius: "0px",
	},
	elements: {
		cardBox: {
			backgroundColor: "transparent",
			border: "0",
			borderRadius: "0",
			boxShadow: "none",
			color: "var(--card-foreground)",
			width: "100%",
		},
		card: {
			backgroundColor: "transparent",
			boxShadow: "none",
			color: "var(--card-foreground)",
			padding: "1rem",
		},
		userButtonPopoverCard: {
			backgroundColor: "var(--popover)",
			border: "2px solid var(--comic-ink)",
			boxShadow: "5px 5px 0 var(--comic-teal)",
			color: "var(--popover-foreground)",
		},
		userButtonPopoverActionButton: {
			color: "var(--popover-foreground)",
			"&:hover": {
				backgroundColor: "var(--accent)",
				color: "var(--accent-foreground)",
			},
		},
		userButtonPopoverActionButtonText: {
			color: "var(--popover-foreground)",
		},
		userButtonPopoverActionButtonIconBox: {
			color: "var(--popover-foreground)",
		},
		userButtonPopoverActionButtonIcon: {
			color: "var(--popover-foreground)",
			stroke: "currentColor",
		},
		userButtonPopoverFooter: {
			backgroundColor: "var(--popover)",
			color: "var(--muted-foreground)",
		},
		userPreviewMainIdentifier: {
			color: "var(--popover-foreground)",
		},
		userPreviewSecondaryIdentifier: {
			color: "var(--muted-foreground)",
		},
		headerTitle: "text-foreground",
		headerSubtitle: "text-muted-foreground",
		socialButtonsBlockButton: {
			backgroundColor: "var(--secondary)",
			border: "2px solid var(--comic-ink)",
			borderRadius: "0",
			boxShadow: "3px 3px 0 var(--comic-ink)",
			color: "var(--secondary-foreground)",
			"&:hover": {
				backgroundColor: "var(--accent)",
			},
		},
		socialButtonsBlockButtonText: {
			color: "var(--secondary-foreground)",
			fontWeight: 600,
		},
		socialButtonsProviderIcon: "shrink-0",
		formButtonPrimary:
			"rounded-none border-2 border-foreground bg-primary font-black uppercase text-primary-foreground shadow-[3px_3px_0_var(--comic-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--comic-ink)]",
		formFieldInput:
			"rounded-none border-2 border-foreground bg-background text-foreground focus:border-ring focus:ring-ring",
		footerActionText: "text-muted-foreground",
		footerActionLink: "text-primary hover:text-primary/90",
		dividerLine: "bg-border",
		dividerText: "text-muted-foreground",
		identityPreviewText: "text-foreground",
		identityPreviewEditButton: "text-primary",
	},
} satisfies Appearance;
