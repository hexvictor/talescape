export function mapByKey<T, K extends keyof T>(
	items: T[],
	key: K,
): Record<string, T> {
	return Object.fromEntries(items.map((item) => [String(item[key]), item]));
}
