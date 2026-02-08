// Interpolation utility functions for the animation editor

import type { AnimationKeyframe, PlayerPosition, EquipmentItem } from "../../types"
import type { InterpolatedState } from "../types"

/** Ease-in-out quadratic easing function. */
export function easeInOutQuad(t: number): number {
	return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/**
 * Calculate element scale during transitions (zoom in/out effect).
 * Returns a value between 0 and 1 representing the element's visibility scale.
 *
 * Elements appearing zoom in fast (first third of transition).
 * Elements disappearing zoom out fast (last third of transition).
 */
export function getElementScale(
	elementId: string,
	fromFrame: AnimationKeyframe,
	toFrame: AnimationKeyframe,
	progress: number,
	type: "player" | "equipment"
): number {
	const fromElements = type === "player" ? fromFrame.players : (fromFrame.equipment || [])
	const toElements = type === "player" ? toFrame.players : (toFrame.equipment || [])

	const inFrom = fromElements.some((e) => e.id === elementId)
	const inTo = toElements.some((e) => e.id === elementId)

	// Make zoom animations 3x faster (complete in first third of transition)
	const fastProgress = Math.min(1, progress * 3)
	const fastReverseProgress = Math.max(0, 1 - (1 - progress) * 3)

	if (inFrom && inTo) return 1                    // Visible throughout
	if (!inFrom && inTo) return fastProgress         // Appearing: zoom in fast
	if (inFrom && !inTo) return fastReverseProgress  // Disappearing: zoom out fast at end
	return 0
}

/**
 * Interpolate between keyframes for smooth animation playback.
 *
 * Given a set of keyframes and the current playback progress (0..1),
 * returns the interpolated frame state including player/equipment positions
 * and their visibility scales.
 *
 * The `isPlaying` guard is handled by the orchestrator's useMemo — this function
 * is only called during playback with valid keyframes.
 */
export function getInterpolatedState(
	keyframes: AnimationKeyframe[],
	playbackProgress: number
): InterpolatedState {
	if (keyframes.length < 2) {
		return {
			frame: keyframes[0],
			playerScales: {},
			equipmentScales: {},
		}
	}

	const totalSegments = keyframes.length - 1
	const progressPerSegment = 1 / totalSegments
	const currentSegment = Math.floor(playbackProgress / progressPerSegment)
	const segmentProgress =
		(playbackProgress - currentSegment * progressPerSegment) / progressPerSegment

	const fromFrame = keyframes[Math.min(currentSegment, keyframes.length - 1)]
	const toFrame = keyframes[Math.min(currentSegment + 1, keyframes.length - 1)]

	if (!fromFrame || !toFrame) {
		return {
			frame: keyframes[0],
			playerScales: {},
			equipmentScales: {},
		}
	}

	const easedProgress = easeInOutQuad(segmentProgress)

	// Collect all unique player IDs from both frames
	const allPlayerIds = new Set([
		...fromFrame.players.map((p) => p.id),
		...toFrame.players.map((p) => p.id),
	])

	// Calculate scales for each player
	const playerScales: Record<string, number> = {}
	allPlayerIds.forEach((id) => {
		playerScales[id] = getElementScale(id, fromFrame, toFrame, easedProgress, "player")
	})

	// Interpolate players that exist in both frames, include appearing/disappearing ones
	const interpolatedPlayers: PlayerPosition[] = []
	allPlayerIds.forEach((id) => {
		const fromPlayer = fromFrame.players.find((p) => p.id === id)
		const toPlayer = toFrame.players.find((p) => p.id === id)

		if (fromPlayer && toPlayer) {
			// Exists in both - interpolate position
			interpolatedPlayers.push({
				...fromPlayer,
				x: fromPlayer.x + (toPlayer.x - fromPlayer.x) * easedProgress,
				y: fromPlayer.y + (toPlayer.y - fromPlayer.y) * easedProgress,
			})
		} else if (fromPlayer) {
			// Disappearing - keep at last position
			interpolatedPlayers.push(fromPlayer)
		} else if (toPlayer) {
			// Appearing - show at target position
			interpolatedPlayers.push(toPlayer)
		}
	})

	const interpolatedBall = {
		x: fromFrame.ball.x + (toFrame.ball.x - fromFrame.ball.x) * easedProgress,
		y: fromFrame.ball.y + (toFrame.ball.y - fromFrame.ball.y) * easedProgress,
	}

	// Collect all unique equipment IDs from both frames
	const allEquipmentIds = new Set([
		...(fromFrame.equipment || []).map((e) => e.id),
		...(toFrame.equipment || []).map((e) => e.id),
	])

	// Calculate scales for each equipment
	const equipmentScales: Record<string, number> = {}
	allEquipmentIds.forEach((id) => {
		equipmentScales[id] = getElementScale(id, fromFrame, toFrame, easedProgress, "equipment")
	})

	// Interpolate equipment
	const interpolatedEquipment: EquipmentItem[] = []
	allEquipmentIds.forEach((id) => {
		const fromEquip = (fromFrame.equipment || []).find((e) => e.id === id)
		const toEquip = (toFrame.equipment || []).find((e) => e.id === id)

		if (fromEquip && toEquip) {
			interpolatedEquipment.push({
				...fromEquip,
				x: fromEquip.x + (toEquip.x - fromEquip.x) * easedProgress,
				y: fromEquip.y + (toEquip.y - fromEquip.y) * easedProgress,
			})
		} else if (fromEquip) {
			interpolatedEquipment.push(fromEquip)
		} else if (toEquip) {
			interpolatedEquipment.push(toEquip)
		}
	})

	return {
		frame: {
			...fromFrame,
			players: interpolatedPlayers,
			ball: interpolatedBall,
			equipment: interpolatedEquipment,
		},
		playerScales,
		equipmentScales,
	}
}
