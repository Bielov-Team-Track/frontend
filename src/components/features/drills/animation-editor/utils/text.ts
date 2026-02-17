// Text utility functions for the animation editor

/**
 * Split text into lines that fit within a maximum character width.
 * Truncates words longer than maxCharsPerLine and caps output at 4 lines.
 */
export function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
	const words = text.split(' ')
	const lines: string[] = []
	let currentLine = ''

	for (const word of words) {
		if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
			currentLine = currentLine ? `${currentLine} ${word}` : word
		} else {
			if (currentLine) lines.push(currentLine)
			currentLine = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine - 1) + '\u2026' : word
		}
	}
	if (currentLine) lines.push(currentLine)
	return lines.slice(0, 4) // Max 4 lines
}
