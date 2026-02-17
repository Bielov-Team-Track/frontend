// Keyframe utility functions for the animation editor

import type { AnimationKeyframe } from "../../types"
import { PLAYER_COLORS, COURT_WIDTH, COURT_HEIGHT } from "../constants"

/**
 * Create an initial keyframe with players in a standard volleyball formation
 * on the bottom half (home team side).
 *
 * Front row: positions 4, 3, 2 (left to right near net)
 * Back row: positions 5, 6, 1 (left to right)
 */
export function createInitialKeyframe(playerCount: number = 6): AnimationKeyframe {
	return {
		id: crypto.randomUUID(),
		players: Array.from({ length: playerCount }, (_, i) => ({
			id: `p${i + 1}`,
			x: 60 + (i % 3) * 100,
			y: COURT_HEIGHT / 2 + 70 + Math.floor(i / 3) * 130,
			color: PLAYER_COLORS[i % PLAYER_COLORS.length],
			label: String(i + 1),
		})),
		ball: { x: COURT_WIDTH / 2, y: COURT_HEIGHT / 2 + 120 },
		equipment: [],
	}
}
