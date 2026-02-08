// Coordinate utility functions for the animation editor

import type { CourtViewMode } from "../../types"
import { COURT_WIDTH, COURT_HEIGHT, COURT_PADDING } from "../constants"

/**
 * Convert mouse event coordinates to SVG court coordinates.
 * Accounts for half-court view mode where the viewBox starts at COURT_HEIGHT/2.
 * Returns `null` if the SVG ref is not available.
 */
export function getSVGCoordinates(
	e: React.MouseEvent<SVGSVGElement> | React.DragEvent<SVGSVGElement>,
	svgRef: React.RefObject<SVGSVGElement | null>,
	courtViewMode: CourtViewMode
): { x: number; y: number } | null {
	if (!svgRef.current) return null
	const rect = svgRef.current.getBoundingClientRect()
	const x = ((e.clientX - rect.left) / rect.width) * COURT_WIDTH

	// Account for half court view mode where viewBox starts at COURT_HEIGHT/2
	let y: number
	if (courtViewMode === "half") {
		// In half view, the visible area is the bottom half of the court
		y = ((e.clientY - rect.top) / rect.height) * (COURT_HEIGHT / 2) + (COURT_HEIGHT / 2)
	} else {
		y = ((e.clientY - rect.top) / rect.height) * COURT_HEIGHT
	}

	// Keep elements within court boundaries
	return {
		x: Math.max(COURT_PADDING + 10, Math.min(COURT_WIDTH - COURT_PADDING - 10, x)),
		y: Math.max(COURT_PADDING + 10, Math.min(COURT_HEIGHT - COURT_PADDING - 10, y)),
	}
}
