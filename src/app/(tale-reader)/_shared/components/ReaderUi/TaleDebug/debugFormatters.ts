export function yesNo(value: boolean | null | undefined) {
	if (value == null) return "-";
	return value ? "Yes" : "No";
}

export function formatIndex(index: number | null | undefined) {
	if (index == null || index < 0) return "-";
	return `${index} (#${index + 1})`;
}

export function formatIdIndex(
	id: number | null | undefined,
	index: number | null | undefined,
) {
	if (id == null) return "-";
	return index == null ? String(id) : `${id} / ${formatIndex(index)}`;
}

export function formatList(value: number[] | null | undefined) {
	if (!value?.length) return "-";
	return value.join(", ");
}

export function formatDate(value: Date | string | null | undefined) {
	if (!value) return "-";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleString();
}

export function round(value: number) {
	return Math.round(value);
}
