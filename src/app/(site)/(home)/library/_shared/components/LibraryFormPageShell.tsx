import type { ReactNode } from "react";
import { Suspense } from "react";
import { DetailPageSkeleton } from "../../../_components/skeletons";

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
	return <Suspense fallback={<DetailPageSkeleton />}>{children}</Suspense>;
}
