export default function toTitleCase(str: string): string {
	return str
		.replace(/[-_]+/g, " ") // replace - and _ with space
		.split(" ") // split into words
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // capitalize
		.join(" ");
}
