export const getParamsFromObject = (obj: Record<string, unknown> | undefined): Record<string, string> => {
	if (obj === undefined) return {};
	return Object.fromEntries(
		Object.entries(obj)
			.filter(([_, value]) => value !== undefined)
			.map(([key, value]) => {
				const stringValue = typeof value === "string" ? value : String(value);
				return [key, stringValue];
			})
	);
};
