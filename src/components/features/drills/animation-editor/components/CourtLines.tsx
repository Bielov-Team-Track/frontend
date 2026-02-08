import React from "react"
import type { CourtViewMode } from "../../types"
import { COURT_WIDTH, COURT_HEIGHT, COURT_PADDING } from "../constants"

interface CourtLinesProps {
	viewMode: CourtViewMode
}

const CourtLinesInner = ({ viewMode }: CourtLinesProps) => {
	// Court boundaries
	const courtLeft = COURT_PADDING
	const courtRight = COURT_WIDTH - COURT_PADDING
	const courtTop = COURT_PADDING
	const courtBottom = COURT_HEIGHT - COURT_PADDING
	const courtMidY = COURT_HEIGHT / 2
	// Attack line is 3m from net (1/6 of total court length)
	const attackLineOffset = (courtBottom - courtTop) / 6

	if (viewMode === "empty") return null

	return (
		<>
			{/* Court outline */}
			<rect
				x={courtLeft}
				y={courtTop}
				width={courtRight - courtLeft}
				height={courtBottom - courtTop}
				fill="none"
				stroke="white"
				strokeWidth="2"
			/>
			{/* Center line (net) - runs horizontally */}
			<line x1={courtLeft} y1={courtMidY} x2={courtRight} y2={courtMidY} stroke="white" strokeWidth="3" />
			{/* Attack lines (3m from net) */}
			<line
				x1={courtLeft}
				y1={courtMidY - attackLineOffset}
				x2={courtRight}
				y2={courtMidY - attackLineOffset}
				stroke="white"
				strokeWidth="1"
				strokeDasharray="5"
			/>
			<line
				x1={courtLeft}
				y1={courtMidY + attackLineOffset}
				x2={courtRight}
				y2={courtMidY + attackLineOffset}
				stroke="white"
				strokeWidth="1"
				strokeDasharray="5"
			/>
			{/* Position markers for bottom half (home team) - standard volleyball rotation */}
			{viewMode === "full" && [
				// Front row (near net)
				{ x: 60, y: courtMidY + 70, label: "4" },
				{ x: 160, y: courtMidY + 70, label: "3" },
				{ x: 260, y: courtMidY + 70, label: "2" },
				// Back row
				{ x: 60, y: courtMidY + 200, label: "5" },
				{ x: 160, y: courtMidY + 200, label: "6" },
				{ x: 260, y: courtMidY + 200, label: "1" },
			].map((pos) => (
				<text
					key={pos.label}
					x={pos.x}
					y={pos.y}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize="14"
					fill="rgba(255,255,255,0.25)"
					fontWeight="bold"
				>
					{pos.label}
				</text>
			))}
		</>
	)
}

const CourtLines = React.memo(CourtLinesInner, (prev, next) => {
	return prev.viewMode === next.viewMode
})

CourtLines.displayName = "CourtLines"

export default CourtLines
