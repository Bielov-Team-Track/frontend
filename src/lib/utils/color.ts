import { hashString } from "./string";

function hashToColor(hash: number) {
	const absoluteHash = Math.abs(hash);

	// Convert hash to Hue (0-360), keep Saturation at a moderate level (e.g., 60%), and Lightness high (e.g., 85%) for pale colors
	const hue = absoluteHash % 360; // Hue value is a circle, so we use modulo 360
	const saturation = 60; // Percentage of saturation
	const lightness = 30; // Percentage of lightness to ensure paleness

	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function stringToColor(string: string) {
	const hash = hashString(string);
	return hashToColor(hash);
}
