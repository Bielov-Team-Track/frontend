import { useCallback } from "react"
import type { CourtViewMode } from "../../types"
import { COURT_WIDTH, COURT_HEIGHT } from "../constants"
import type { MarqueeRect } from "../hooks/useMarqueeSelect"
import CourtLines from "./CourtLines"

interface CourtCanvasProps {
	svgRef: React.RefObject<SVGSVGElement | null>
	viewMode: CourtViewMode
	width?: number
	height?: number
	onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
	onMouseUp: () => void
	onMouseLeave: () => void
	onDragOver: (e: React.DragEvent<SVGSVGElement>) => void
	onDrop: (e: React.DragEvent<SVGSVGElement>) => void
	onBackgroundClick?: () => void
	onBackgroundMouseDown?: (e: React.MouseEvent<SVGSVGElement>) => void
	marqueeRect?: MarqueeRect | null
	children?: React.ReactNode
}

function getViewBox(viewMode: CourtViewMode): string {
	switch (viewMode) {
		case "half":
			return `0 ${COURT_HEIGHT / 2} ${COURT_WIDTH} ${COURT_HEIGHT / 2}`
		case "empty":
		case "full":
		default:
			return `0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`
	}
}

// NOT memoized - children break React.memo (new reference every render)
function CourtCanvas({
	svgRef,
	viewMode,
	width = 400,
	height = 800,
	onMouseMove,
	onMouseUp,
	onMouseLeave,
	onDragOver,
	onDrop,
	onBackgroundClick,
	onBackgroundMouseDown,
	marqueeRect,
	children,
}: CourtCanvasProps) {
	const bgClass = viewMode === "empty" ? "bg-slate-700" : "bg-green-800"

	const isBackground = (e: React.MouseEvent<SVGSVGElement>) =>
		e.target === e.currentTarget || (e.target as SVGElement).dataset.courtBg !== undefined

	// Only fire when clicking the SVG background itself, not child elements like players/equipment
	const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		if (isBackground(e)) onBackgroundClick?.()
	}, [onBackgroundClick])

	const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		if (isBackground(e)) onBackgroundMouseDown?.(e)
	}, [onBackgroundMouseDown])

	return (
		<div className="border-2 border-gray-600 rounded-lg overflow-hidden">
			<svg
				ref={svgRef}
				viewBox={getViewBox(viewMode)}
				width={width}
				height={viewMode === "half" ? height / 2 : height}
				className={`${bgClass} cursor-crosshair`}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseLeave}
				onDrop={onDrop}
				onDragOver={onDragOver}
				onMouseDown={handleMouseDown}
				onClick={handleClick}
			>
				<CourtLines viewMode={viewMode} />
				{children}
				{marqueeRect && (
					<rect
						x={marqueeRect.x}
						y={marqueeRect.y}
						width={marqueeRect.width}
						height={marqueeRect.height}
						fill="rgba(59, 130, 246, 0.15)"
						stroke="rgba(59, 130, 246, 0.6)"
						strokeWidth="1"
						strokeDasharray="4 2"
						pointerEvents="none"
					/>
				)}
			</svg>
		</div>
	)
}

export default CourtCanvas
