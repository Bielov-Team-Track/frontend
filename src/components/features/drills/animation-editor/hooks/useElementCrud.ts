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

interface ClipboardEntry {
	type: "player" | "equipment"
	id: string
	x: number
	y: number
}

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
		if (currentKeyframe.players.length <= 1) return // Keep at least one player
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Keep in earlier frames
				return {
					...frame,
					players: frame.players.filter((p) => p.id !== playerId),
				}
			})
		)
	}, [currentFrameIndex, currentKeyframe])

	// Delete multiple selected elements from current frame onwards
	const deleteSelected = useCallback((selectedElements: ElementRef[]) => {
		if (selectedElements.length === 0) return
		const playerIds = new Set(selectedElements.filter((el) => el.type === "player").map((el) => el.id))
		const equipmentIds = new Set(selectedElements.filter((el) => el.type === "equipment").map((el) => el.id))

		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame
				const remainingPlayers = frame.players.filter((p) => !playerIds.has(p.id))
				// Keep at least one player
				const players = remainingPlayers.length > 0 ? remainingPlayers : frame.players
				return {
					...frame,
					players,
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

	/** Nudge selected elements by dx, dy pixels on current frame. */
	const nudge = useCallback((selectedElements: ElementRef[], dx: number, dy: number) => {
		if (selectedElements.length === 0) return
		const playerIds = new Set(selectedElements.filter((el) => el.type === "player").map((el) => el.id))
		const equipmentIds = new Set(selectedElements.filter((el) => el.type === "equipment").map((el) => el.id))

		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index !== currentFrameIndex) return frame
				return {
					...frame,
					players: frame.players.map((p) =>
						playerIds.has(p.id) ? { ...p, x: p.x + dx, y: p.y + dy } : p
					),
					equipment: (frame.equipment || []).map((eq) =>
						equipmentIds.has(eq.id) ? { ...eq, x: eq.x + dx, y: eq.y + dy } : eq
					),
				}
			})
		)
	}, [currentFrameIndex])

	/** Duplicate selected elements in place with +20,+20 offset, add to current + subsequent frames. */
	const duplicateSelected = useCallback((selectedElements: ElementRef[]) => {
		if (selectedElements.length === 0) return

		setKeyframes((prev) => {
			const currentFrame = prev[currentFrameIndex]
			const newPlayers: PlayerPosition[] = []
			const newEquipment: EquipmentItem[] = []

			for (const ref of selectedElements) {
				if (ref.type === "player") {
					const source = currentFrame.players.find((p) => p.id === ref.id)
					if (source) {
						newPlayers.push({
							...source,
							id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
							x: source.x + 20,
							y: source.y + 20,
							firstFrameIndex: currentFrameIndex,
						})
					}
				} else {
					const source = (currentFrame.equipment || []).find((eq) => eq.id === ref.id)
					if (source) {
						newEquipment.push({
							...source,
							id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
							x: source.x + 20,
							y: source.y + 20,
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

	/** Copy positions of selected elements (or all if none selected) on current frame. */
	const copyPositions = useCallback((selectedElements: ElementRef[]) => {
		const entries: ClipboardEntry[] = []

		if (selectedElements.length > 0) {
			const ids = new Set(selectedElements.map((el) => el.id))
			for (const p of currentKeyframe.players) {
				if (ids.has(p.id)) entries.push({ type: "player", id: p.id, x: p.x, y: p.y })
			}
			for (const eq of currentKeyframe.equipment || []) {
				if (ids.has(eq.id)) entries.push({ type: "equipment", id: eq.id, x: eq.x, y: eq.y })
			}
		} else {
			for (const p of currentKeyframe.players) {
				entries.push({ type: "player", id: p.id, x: p.x, y: p.y })
			}
			for (const eq of currentKeyframe.equipment || []) {
				entries.push({ type: "equipment", id: eq.id, x: eq.x, y: eq.y })
			}
		}

		clipboardRef.current = entries
	}, [currentKeyframe])

	/** Paste copied positions onto current frame, matching by element ID. */
	const pastePositions = useCallback(() => {
		const clipboard = clipboardRef.current
		if (clipboard.length === 0) return

		const posMap = new Map(clipboard.map((e) => [e.id, { x: e.x, y: e.y }]))

		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index !== currentFrameIndex) return frame
				return {
					...frame,
					players: frame.players.map((p) => {
						const pos = posMap.get(p.id)
						return pos ? { ...p, x: pos.x, y: pos.y } : p
					}),
					equipment: (frame.equipment || []).map((eq) => {
						const pos = posMap.get(eq.id)
						return pos ? { ...eq, x: pos.x, y: pos.y } : eq
					}),
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
					ball: { x: 2 * centerX - frame.ball.x, y: frame.ball.y },
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
		deleteEquipment,
		deletePlayer,
		deleteSelected,
		updateNote,
		updateLabel,
		nudge,
		duplicateSelected,
		copyPositions,
		pastePositions,
		mirrorFormation,
		swapPlayers,
	}
}
