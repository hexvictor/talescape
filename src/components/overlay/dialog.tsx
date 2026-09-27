"use client";

import { XIcon } from "lucide-react";
import {
	Children,
	type ComponentProps,
	type ReactElement,
	type ReactNode,
	cloneElement,
	isValidElement,
} from "react";
import { mergeProps } from "react-aria";
import {
	Button as AriaButton,
	type ButtonProps as AriaButtonProps,
	Dialog as AriaDialog,
	DialogTrigger as AriaDialogTrigger,
	type DialogTriggerProps as AriaDialogTriggerProps,
	Heading as AriaHeading,
	Modal as AriaModal,
	ModalOverlay as AriaModalOverlay,
	type ModalOverlayProps as AriaModalOverlayProps,
	Text as AriaText,
} from "react-aria-components";
import cn from "~/lib/utils/cn";

export type DialogProps = Omit<
	AriaDialogTriggerProps,
	"defaultOpen" | "isOpen"
> & {
	defaultOpen?: boolean;
	open?: boolean;
};

function Dialog({
	defaultOpen,
	open,
	...props
}: DialogProps): React.JSX.Element | null {
	return (
		<AriaDialogTrigger {...props} defaultOpen={defaultOpen} isOpen={open} />
	);
}

export type DialogTriggerProps = Omit<AriaButtonProps, "children"> & {
	asChild?: boolean;
	children: ReactNode;
};

function DialogTrigger({
	asChild = false,
	children,
	...props
}: DialogTriggerProps): React.JSX.Element {
	if (asChild) {
		const child = Children.only(children);
		if (!isValidElement(child)) {
			throw new Error(
				"DialogTrigger with asChild requires one valid React element.",
			);
		}

		const element = child as ReactElement<Record<string, unknown>>;
		return cloneElement(element, mergeProps(element.props, props));
	}

	return (
		<AriaButton {...props} data-slot="dialog-trigger">
			{children}
		</AriaButton>
	);
}

export type DialogCloseProps = Omit<AriaButtonProps, "children"> & {
	asChild?: boolean;
	children?: ReactNode;
};

function DialogClose({
	asChild = false,
	children,
	...props
}: DialogCloseProps): React.JSX.Element {
	if (asChild) {
		const child = Children.only(children);
		if (!isValidElement(child)) {
			throw new Error(
				"DialogClose with asChild requires one valid React element.",
			);
		}

		const element = child as ReactElement<Record<string, unknown>>;
		return cloneElement(
			element,
			mergeProps(element.props, props, { slot: "close" }),
		);
	}

	return (
		<AriaButton {...props} data-slot="dialog-close" slot="close">
			{children}
		</AriaButton>
	);
}

function DialogPortal({
	children,
}: { children?: ReactNode }): React.JSX.Element {
	return <>{children}</>;
}

function DialogOverlay({
	children,
	className,
	isDismissable = true,
	...props
}: AriaModalOverlayProps): React.JSX.Element {
	return (
		<AriaModalOverlay
			{...props}
			isDismissable={isDismissable}
			data-slot="dialog-overlay"
			className={cn(
				"data-[entering]:fade-in-0 data-[exiting]:fade-out-0 fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[var(--comic-ink)]/85 p-4 data-[entering]:animate-in data-[exiting]:animate-out",
				typeof className === "string" ? className : undefined,
			)}
		>
			{children}
		</AriaModalOverlay>
	);
}

export type DialogContentProps = Omit<ComponentProps<"div">, "title"> & {
	closeButtonClassName?: string;
	isDismissable?: boolean;
	showCloseButton?: boolean;
};

function DialogContent({
	className,
	children,
	closeButtonClassName,
	isDismissable = true,
	showCloseButton = true,
	...props
}: DialogContentProps): React.JSX.Element {
	return (
		<DialogOverlay isDismissable={isDismissable}>
			<AriaModal
				{...props}
				data-slot="dialog-content"
				className={cn(
					"data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 relative w-full max-w-[calc(100%-2rem)] border-[3px] border-foreground bg-card p-6 shadow-[10px_10px_0_var(--comic-teal)] outline-none duration-200 data-[entering]:animate-in data-[exiting]:animate-out sm:max-w-lg",
					className,
				)}
			>
				<AriaDialog className="grid gap-4 outline-none">
					{children}
					{showCloseButton ? (
						<AriaButton
							slot="close"
							aria-label="Close"
							data-slot="dialog-close"
							className={cn(
								"absolute top-4 right-4 grid size-11 place-items-center border-2 border-foreground bg-card text-foreground shadow-[3px_3px_0_rgb(var(--foreground-rgb))] outline-none transition-[transform,box-shadow] hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-[1px_1px_0_rgb(var(--foreground-rgb))] focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
								closeButtonClassName,
							)}
						>
							<XIcon aria-hidden="true" />
						</AriaButton>
					) : null}
				</AriaDialog>
			</AriaModal>
		</DialogOverlay>
	);
}

function DialogHeader({
	className,
	...props
}: ComponentProps<"header">): React.JSX.Element {
	return (
		<header
			{...props}
			data-slot="dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
		/>
	);
}

function DialogFooter({
	className,
	...props
}: ComponentProps<"footer">): React.JSX.Element {
	return (
		<footer
			{...props}
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: ComponentProps<typeof AriaHeading>): React.JSX.Element {
	return (
		<AriaHeading
			{...props}
			slot="title"
			data-slot="dialog-title"
			className={cn("comic-display text-2xl leading-none", className)}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: ComponentProps<typeof AriaText>): React.JSX.Element {
	return (
		<AriaText
			{...props}
			slot="description"
			data-slot="dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
