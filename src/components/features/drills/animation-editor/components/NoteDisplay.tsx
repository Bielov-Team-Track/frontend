import { splitTextIntoLines } from "../utils/text"

// Note display component - full text, multi-line, with delete button
const NoteDisplay = ({
	x,
	y,
	note,
	color,
	onDelete,
	isPlaying,
}: {
	x: number
	y: number
	note: string
	color: string
	onDelete: () => void
	isPlaying: boolean
}) => {
	const maxCharsPerLine = 14
	const lines = splitTextIntoLines(note, maxCharsPerLine)
	const lineHeight = 12
	const padding = 6
	const boxWidth = 90
	const boxHeight = lines.length * lineHeight + padding * 2

	// Calculate position to stay within court bounds
	// Court: x from 20 to 300, y from 20 to 620
	let noteX = x - boxWidth / 2
	let noteY = y + 20

	// Clamp to court boundaries
	if (noteX < 22) noteX = 22
	if (noteX + boxWidth > 298) noteX = 298 - boxWidth
	if (noteY + boxHeight > 618) noteY = y - boxHeight - 20 // Show above if no room below

	const centerX = noteX + boxWidth / 2

	return (
		<g>
			{/* Background */}
			<rect
				x={noteX}
				y={noteY}
				width={boxWidth}
				height={boxHeight}
				rx="4"
				fill={color}
				style={{ pointerEvents: "none" }}
			/>
			{/* Delete button */}
			{!isPlaying && (
				<g
					onClick={(e) => {
						e.stopPropagation()
						onDelete()
					}}
					style={{ cursor: "pointer" }}
				>
					<circle
						cx={noteX + boxWidth - 2}
						cy={noteY + 2}
						r="7"
						fill="#ef4444"
					/>
					<text
						x={noteX + boxWidth - 2}
						y={noteY + 6}
						textAnchor="middle"
						fontSize="10"
						fill="white"
						fontWeight="bold"
						style={{ pointerEvents: "none" }}
					>
						×
					</text>
				</g>
			)}
			{/* Text lines */}
			{lines.map((line, i) => (
				<text
					key={i}
					x={centerX}
					y={noteY + padding + 9 + i * lineHeight}
					textAnchor="middle"
					fontSize="9"
					fill="white"
					fontWeight="500"
					style={{ pointerEvents: "none" }}
				>
					{line}
				</text>
			))}
		</g>
	)
}

export default NoteDisplay
