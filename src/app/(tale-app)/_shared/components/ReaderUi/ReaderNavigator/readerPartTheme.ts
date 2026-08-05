import type { CSSProperties } from "react";

const readerPartPalettes = [
	{
		border: "rgb(193 98 50 / 0.42)",
		contrast: "rgb(255 248 241)",
		soft: "rgb(193 98 50 / 0.14)",
		softStrong: "rgb(193 98 50 / 0.24)",
		solid: "rgb(193 98 50)",
	},
	{
		border: "rgb(55 132 112 / 0.42)",
		contrast: "rgb(244 255 250)",
		soft: "rgb(55 132 112 / 0.14)",
		softStrong: "rgb(55 132 112 / 0.24)",
		solid: "rgb(55 132 112)",
	},
	{
		border: "rgb(99 111 201 / 0.42)",
		contrast: "rgb(246 248 255)",
		soft: "rgb(99 111 201 / 0.14)",
		softStrong: "rgb(99 111 201 / 0.24)",
		solid: "rgb(99 111 201)",
	},
	{
		border: "rgb(143 90 166 / 0.42)",
		contrast: "rgb(251 245 255)",
		soft: "rgb(143 90 166 / 0.14)",
		softStrong: "rgb(143 90 166 / 0.24)",
		solid: "rgb(143 90 166)",
	},
	{
		border: "rgb(143 124 49 / 0.42)",
		contrast: "rgb(255 252 241)",
		soft: "rgb(143 124 49 / 0.14)",
		softStrong: "rgb(143 124 49 / 0.24)",
		solid: "rgb(143 124 49)",
	},
	{
		border: "rgb(178 84 107 / 0.42)",
		contrast: "rgb(255 246 249)",
		soft: "rgb(178 84 107 / 0.14)",
		softStrong: "rgb(178 84 107 / 0.24)",
		solid: "rgb(178 84 107)",
	},
] as const;

function getReaderPartPalette(partNumber: number) {
	const safeIndex = Math.max(partNumber - 1, 0) % readerPartPalettes.length;
	return readerPartPalettes[safeIndex] ?? readerPartPalettes[0];
}

export function getReaderPartLabel(partNumber: number): string {
	return `P${partNumber}`;
}

export function getReaderPartTheme(partNumber: number): CSSProperties {
	const palette = getReaderPartPalette(partNumber);
	return {
		"--reader-part-border": palette.border,
		"--reader-part-contrast": palette.contrast,
		"--reader-part-soft": palette.soft,
		"--reader-part-soft-strong": palette.softStrong,
		"--reader-part-solid": palette.solid,
	} as CSSProperties;
}
