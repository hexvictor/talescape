import type { ReactNode } from "react";
import { Suspense } from "react";
import { DetailPageSkeleton } from "~/app/(site)/_shared/components/skeletons";
import { PageShell } from "~/components/layout/page-shell";

/**
 * Provides the shared suspense boundary for full-page library forms.
 *
 * @param props - Form page props.
 * @param props.children - Author or book form.
 * @returns Suspense-wrapped form.
 *
 * @example
 * <LibraryFormPageShell><BookFormPanel mode="create" /></LibraryFormPageShell>
 */
export function LibraryFormPageShell({ children }: { children: ReactNode }) {
	return (
		<PageShell decorations="form">
			<Suspense fallback={<DetailPageSkeleton />}>{children}</Suspense>
		</PageShell>
	);
}
