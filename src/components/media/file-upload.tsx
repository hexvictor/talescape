"use client";

import { LoaderCircle, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { ProgressBar } from "~/components/data-display/progress-bar";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";

export type FileUploadProps = {
	label: string;
	accept?: string;
	maxBytes?: number;
	isDisabled?: boolean;
	className?: string;
	/** The host owns authentication, persistence and the upload transport. */
	upload: (
		file: File,
		reportProgress: (percent: number) => void,
	) => Promise<string>;
	onUploaded: (url: string, file: File) => void;
};

export function FileUpload({
	label,
	accept = "image/*",
	maxBytes = 4 * 1024 * 1024,
	isDisabled,
	className,
	upload,
	onUploaded,
}: FileUploadProps): React.JSX.Element {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const busy = useRef(false);
	const [state, setState] = useState<
		"idle" | "uploading" | "complete" | "error"
	>("idle");
	const [progress, setProgress] = useState(0);
	const [message, setMessage] = useState("");
	const [fileName, setFileName] = useState("");
	const send = async (file?: File) => {
		if (!file || isDisabled || busy.current) return;
		setFileName(file.name);
		const accepted = accept
			.split(",")
			.map((v) => v.trim())
			.some(
				(v) =>
					v === "*/*" ||
					(v.startsWith(".")
						? file.name.toLowerCase().endsWith(v.toLowerCase())
						: v.endsWith("/*")
							? file.type.startsWith(v.slice(0, -1))
							: file.type === v),
			);
		if (!accepted || file.size > maxBytes) {
			setState("error");
			setMessage(
				!accepted
					? "Unsupported file type"
					: `File must be under ${Math.round(maxBytes / 1024 / 1024)} MB`,
			);
			return;
		}
		busy.current = true;
		setState("uploading");
		setProgress(0);
		setMessage("");
		try {
			const url = await upload(file, (percent) =>
				setProgress(Math.min(100, Math.max(0, percent))),
			);
			if (!url) throw new Error("Upload returned no file URL");
			onUploaded(url, file);
			setProgress(100);
			setState("complete");
			setMessage("Uploaded");
		} catch (error) {
			setState("error");
			setMessage(error instanceof Error ? error.message : "Upload failed");
		} finally {
			busy.current = false;
		}
	};
	return (
		<section
			data-reader-component="FileUpload"
			data-reader-role="upload-field"
			aria-busy={state === "uploading"}
			className={cn("grid min-w-0 gap-2", className)}
		>
			<label htmlFor={id} className="font-bold text-xs uppercase">
				{label}
			</label>
			<div
				onDragOver={(event) => event.preventDefault()}
				onDrop={(event) => {
					event.preventDefault();
					void send(event.dataTransfer.files[0]);
				}}
				className="grid gap-3 border-2 border-input border-dashed bg-card p-4"
			>
				<input
					id={id}
					ref={input}
					type="file"
					accept={accept}
					disabled={isDisabled || state === "uploading"}
					className="sr-only"
					onChange={(event) => {
						void send(event.currentTarget.files?.[0]);
						event.currentTarget.value = "";
					}}
				/>
				<div className="flex min-w-0 items-center gap-3">
					<Button
						type="button"
						variant="outline"
						motion="flat"
						disabled={isDisabled || state === "uploading"}
						onPress={() => input.current?.click()}
					>
						{state === "uploading" ? (
							<LoaderCircle className="animate-spin" />
						) : (
							<Upload />
						)}
						{state === "uploading" ? "Uploading" : "Choose file"}
					</Button>
					<span className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
						{fileName || "No file selected"}
					</span>
					{fileName && state !== "uploading" ? (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Clear file"
							disabled={isDisabled}
							onPress={() => {
								setFileName("");
								setState("idle");
								setMessage("");
							}}
						>
							<X />
						</Button>
					) : null}
				</div>
				{state === "uploading" ? <ProgressBar value={progress} /> : null}
			</div>
			{message ? (
				<p
					role={state === "error" ? "alert" : "status"}
					className={cn(
						"text-sm",
						state === "error" ? "text-destructive" : "text-muted-foreground",
					)}
				>
					{message}
				</p>
			) : null}
		</section>
	);
}
