"use client";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/overlay/dialog";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import Textarea from "~/components/ui/textarea";
import type { DraftElementInput } from "../../services/taleDraftEdits";
import { ImageUploadSetting } from "./ImageUploadSetting";

export function AddElementDialog({
	onClose,
	onCreate,
	open,
}: {
	onClose: () => void;
	onCreate: (input: DraftElementInput) => void;
	open: boolean;
}): React.JSX.Element | null {
	const [type, setType] = useState<DraftElementInput["type"]>("text");
	const [label, setLabel] = useState("Text element");
	const [text, setText] = useState("Text element");
	const [imageUrl, setImageUrl] = useState("");
	const [fallbackUrl, setFallbackUrl] = useState("");
	const [alt, setAlt] = useState("");
	const [caption, setCaption] = useState("");
	const [audioUrl, setAudioUrl] = useState("");

	const changeType = (nextType: DraftElementInput["type"]): void => {
		setType(nextType);
		const defaultLabel =
			nextType === "image"
				? "Image element"
				: nextType === "audio"
					? "Audio element"
					: "Text element";
		setLabel(defaultLabel);
		if (nextType === "text" && !text.trim()) setText(defaultLabel);
	};
	const submit = (): void => {
		if (type === "image") {
			onCreate({
				alt,
				caption,
				fallbackSrc: fallbackUrl,
				label,
				src: imageUrl,
				type,
			});
			return;
		}
		if (type === "audio") {
			onCreate({ label, src: audioUrl, type });
			return;
		}
		onCreate({ label, text, type });
	};
	const canCreate =
		label.trim().length > 0 &&
		(type === "text" ? text.trim().length > 0 : true);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="max-h-[min(720px,calc(100dvh-2rem))] max-w-lg overflow-y-auto p-5 shadow-[9px_9px_0_var(--comic-teal)]"
			>
				<DialogHeader>
					<DialogTitle>Add Element</DialogTitle>
				</DialogHeader>
				<div className="mt-4 grid gap-3">
					<Field label="Element type">
						<Select
							aria-label="Element type"
							value={type}
							onValueChange={(value) =>
								changeType(value as DraftElementInput["type"])
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="text">Text</SelectItem>
								<SelectItem value="image">Image</SelectItem>
								<SelectItem value="audio">Audio</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field label="Element name">
						<Input
							aria-label="Element name"
							value={label}
							onChange={(event) => setLabel(event.target.value)}
						/>
					</Field>
					{type === "text" ? (
						<Field label="Text">
							<Textarea
								aria-label="Text"
								className="min-h-28 resize-y"
								value={text}
								onChange={(event) => setText(event.target.value)}
							/>
						</Field>
					) : null}
					{type === "image" ? (
						<>
							<ImageUploadSetting
								label="Image URL"
								value={imageUrl}
								onChange={setImageUrl}
							/>
							<Field label="Fallback URL">
								<Input
									aria-label="Fallback URL"
									value={fallbackUrl}
									onChange={(event) => setFallbackUrl(event.target.value)}
								/>
							</Field>
							<Field label="Alt text">
								<Input
									aria-label="Alt text"
									value={alt}
									onChange={(event) => setAlt(event.target.value)}
								/>
							</Field>
							<Field label="Caption">
								<Textarea
									aria-label="Caption"
									className="min-h-20 resize-y"
									value={caption}
									onChange={(event) => setCaption(event.target.value)}
								/>
							</Field>
						</>
					) : null}
					{type === "audio" ? (
						<Field label="Audio URL">
							<Input
								aria-label="Audio URL"
								value={audioUrl}
								onChange={(event) => setAudioUrl(event.target.value)}
							/>
						</Field>
					) : null}
				</div>
				<DialogFooter className="mt-5">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button disabled={!canCreate} type="button" onClick={submit}>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
