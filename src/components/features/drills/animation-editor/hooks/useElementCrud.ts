import { useCallback, useRef } from "react"
import type { AnimationKeyframe, EquipmentType, EquipmentItem, PlayerPosition } from "../../types"
import type { ElementRef } from "./useMultiSelect"
import { PLAYER_COLORS, COURT_WIDTH, COURT_HEIGHT } from "../constants"

interface UseElementCrudParams {
	keyframes: AnimationKeyframe[]
	setKeyframes: React.Dispatch<React.SetStateAction<AnimationKeyframe[]>>
	currentFrameIndex: number
	currentKeyframe: AnimationKeyframe
	isPlaying: boolean
}

interface ClipboardPlayer {
	type: "player"
	data: PlayerPosition
}

interface ClipboardEquipment {
	type: "equipment"
	data: EquipmentItem
}

type ClipboardEntry = ClipboardPlayer | ClipboardEquipment

export function useElementCrud({
	keyframes,
	setKeyframes,
	currentFrameIndex,
	currentKeyframe,
	isPlaying,
}: UseElementCrudParams) {
	const clipboardRef = useRef<ClipboardEntry[]>([])

	// Click to add equipment at center of home team's half
	const addEquipment = useCallback((type: EquipmentType) => {
		if (isPlaying) return

		const newEquipment: EquipmentItem = {
			id: `eq-${Date.now()}`,
			type,
			x: COURT_WIDTH / 2 + Math.random() * 60 - 30,
			y: COURT_HEIGHT * 0.65 + Math.random() * 60 - 30,
			firstFrameIndex: currentFrameIndex,
		}

		// Add to current frame and subsequent frames only
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Skip earlier frames
				return {
					...frame,
					equipment: [...(frame.equipment || []), { ...newEquipment }],
				}
			})
		)
	}, [currentFrameIndex, isPlaying])

	// Click to add player at center of home team's half
	const addPlayer = useCallback(() => {
		if (isPlaying) return

		const newPlayerId = `p${Date.now()}`
		const newPlayerIndex = currentKeyframe.players.length
		const newPlayer: PlayerPosition = {
			id: newPlayerId,
			x: COURT_WIDTH / 2 + Math.random() * 60 - 30,
			y: COURT_HEIGHT * 0.65 + Math.random() * 60 - 30,
			color: PLAYER_COLORS[newPlayerIndex % PLAYER_COLORS.length],
			label: String(newPlayerIndex + 1),
			firstFrameIndex: currentFrameIndex,
		}

		// Add to current frame and subsequent frames only
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Skip earlier frames
				return {
					...frame,
					players: [...frame.players, { ...newPlayer }],
				}
			})
		)
	}, [currentFrameIndex, isPlaying, currentKeyframe])

	// Delete equipment from current frame onwards
	const deleteEquipment = useCallback((equipmentId: string) => {
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Keep in earlier frames
				return {
					...frame,
					equipment: (frame.equipment || []).filter((eq) => eq.id !== equipmentId),
				}
			})
		)
	}, [currentFrameIndex])

	// Delete player from current frame onwards
	const deletePlayer = useCallback((playerId: string) => {
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Keep in earlier frames
				return {
					...frame,
					players: frame.players.filter((p) => p.id !== playerId),
				}
			})
		)
	}, [currentFrameIndex])

	// Delete multiple selected elements from current frame onwards
	const deleteSelected = useCallback((selectedElements: ElementRef[]) => {
		if (selectedElements.length === 0) return
		const playerIds = new Set(selectedElements.filter((el) => el.type === "player").map((el) => el.id))
		const equipmentIds = new Set(selectedElements.filter((el) => el.type === "equipment").map((el) => el.id))

		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame
				return {
					...frame,
					players: frame.players.filter((p) => !playerIds.has(p.id)),
					equipment: (frame.equipment || []).filter((eq) => !equipmentIds.has(eq.id)),
				}
			})
		)
	}, [currentFrameIndex])

	// Update element note (persists from current frame onwards, like elements)
	const updateNote = useCallback((elementType: "player" | "equipment", elementId: string, note: string) => {
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				// Only update current frame and future frames
				if (index < currentFrameIndex) return frame
				if (elementType === "player") {
					return {
						...frame,
						players: frame.players.map((p) => (p.id === elementId ? { ...p, note: note || undefined } : p)),
					}
				} else {
					return {
						...frame,
						equipment: (frame.equipment || []).map((e) => (e.id === elementId ? { ...e, note: note || undefined } : e)),
					}
				}
			})
		)
	}, [currentFrameIndex])

	// Update element label (applies to all frames where element exists)
	const updateLabel = useCallback((elementType: "player" | "equipment", elementId: string, label: string) => {
		setKeyframes((prev) =>
			prev.map((frame) => {
				if (elementType === "player") {
					return {
						...frame,
						players: frame.players.map((p) => (p.id === elementId ? { ...p, label: label || undefined } : p)),
					}
				} else {
					return {
						...frame,
						equipment: (frame.equipment || []).map((e) => (e.id === elementId ? { ...e, label: label || undefined } : e)),
					}
				}
			})
		)
	}, [])

	/** Delete ball from current frame onwards. */
	const deleteBall = useCallback(() => {
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame
				return { ...frame, ball: undefined }
			})
		)
	}, [currentFrameIndex])

	/** Add ball to current frame onwards. */
	const addBall = useCallback(() => {
		if (isPlaying) return
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame
				if (frame.ball) return frame
				return { ...frame, ball: { x: COURT_WIDTH / 2, y: COURT_HEIGHT * 0.65 } }
			})
		)
	}, [currentFrameIndex, isPlaying])

	/** Duplicate selected elements in place with staggered offset, add to current + subsequent frames. */
	const duplicateSelected = useCallback((selectedElements: ElementRef[]) => {
		if (selectedElements.length === 0) return

		setKeyframes((prev) => {
			const currentFrame = prev[currentFrameIndex]
			const newPlayers: PlayerPosition[] = []
			const newEquipment: EquipmentItem[] = []

			let offsetIndex = 0
			for (const ref of selectedElements) {
				const offset = 20 + offsetIndex * 15
				offsetIndex++
				if (ref.type === "player") {
					const source = currentFrame.players.find((p) => p.id === ref.id)
					if (source) {
						newPlayers.push({
							...source,
							id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
							x: source.x + offset,
							y: source.y + offset,
							firstFrameIndex: currentFrameIndex,
						})
					}
				} else {
					const source = (currentFrame.equipment || []).find((eq) => eq.id === ref.id)
					if (source) {
						newEquipment.push({
							...source,
							id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
							x: source.x + offset,
							y: source.y + offset,
							firstFrameIndex: currentFrameIndex,
						})
					}
				}
			}

			return prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame
				return {
					...frame,
					players: [...frame.players, ...newPlayers.map((p) => ({ ...p }))],
					equipment: [...(frame.equipment || []), ...newEquipment.map((eq) => ({ ...eq }))],
				}
			})
		})
	}, [currentFrameIndex])

	/** Copy selected elements (or all if none selected) to clipboard. */
	const copyElements = useCallback((selectedElements: ElementRef[]) => {
		const entries: ClipboardEntry[] = []
		const ids = selectedElements.length > 0
			? new Set(selectedElements.map((el) => el.id))
			: null

		for (const p of currentKeyframe.players) {
			if (!ids || ids.has(p.id)) entries.push({ type: "player", data: { ...p } })
		}
		for (const eq of currentKeyframe.equipment || []) {
			if (!ids || ids.has(eq.id)) entries.push({ type: "equipment", data: { ...eq } })
		}

		clipboardRef.current = entries
	}, [currentKeyframe])

	/** Paste copied elements as new duplicates onto current frame + subsequent frames. */
	const pasteElements = useCallback(() => {
		const clipboard = clipboardRef.current
		if (clipboard.length === 0) return

		const newPlayers: PlayerPosition[] = []
		const newEquipment: EquipmentItem[] = []

		let offsetIndex = 0
		for (const entry of clipboard) {
			const offset = 20 + offsetIndex * 15
			offsetIndex++
			if (entry.type === "player") {
				newPlayers.push({
					...entry.data,
					id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
					x: entry.data.x + offset,
					y: entry.data.y + offset,
					firstFrameIndex: currentFrameIndex,
				})
			} else {
				newEquipment.push({
					...entry.data,
					id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
					x: entry.data.x + offset,
					y: entry.data.y + offset,
					firstFrameIndex: currentFrameIndex,
				})
			}
		}

		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame
				return {
					...frame,
					players: [...frame.players, ...newPlayers.map((p) => ({ ...p }))],
					equipment: [...(frame.equipment || []), ...newEquipment.map((eq) => ({ ...eq }))],
				}
			})
		)
	}, [currentFrameIndex])

	/** Mirror all element X positions around COURT_WIDTH / 2 on current frame. */
	const mirrorFormation = useCallback(() => {
		const centerX = COURT_WIDTH / 2
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index !== currentFrameIndex) return frame
				return {
					...frame,
					players: frame.players.map((p) => ({ ...p, x: 2 * centerX - p.x })),
					ball: frame.ball ? { x: 2 * centerX - frame.ball.x, y: frame.ball.y } : undefined,
					equipment: (frame.equipment || []).map((eq) => ({ ...eq, x: 2 * centerX - eq.x })),
				}
			})
		)
	}, [currentFrameIndex])

	/** Swap positions of two players on current frame. */
	const swapPlayers = useCallback((idA: string, idB: string) => {
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index !== currentFrameIndex) return frame
				const playerA = frame.players.find((p) => p.id === idA)
				const playerB = frame.players.find((p) => p.id === idB)
				if (!playerA || !playerB) return frame
				return {
					...frame,
					players: frame.players.map((p) => {
						if (p.id === idA) return { ...p, x: playerB.x, y: playerB.y }
						if (p.id === idB) return { ...p, x: playerA.x, y: playerA.y }
						return p
					}),
				}
			})
		)
	}, [currentFrameIndex])

	return {
		addEquipment,
		addPlayer,
		addBall,
		deleteEquipment,
		deletePlayer,
		deleteBall,
		deleteSelected,
		updateNote,
		updateLabel,
		duplicateSelected,
		copyElements,
		pasteElements,
		mirrorFormation,
		swapPlayers,
	}
}
