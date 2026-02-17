import { useState, useCallback, useRef } from "react"
import type { AnimationKeyframe, EquipmentType, PlayerPosition, EquipmentItem, CourtViewMode } from "../../types"
import type { ElementRef } from "./useMultiSelect"
import { getSVGCoordinates } from "../utils/coordinates"
import { PLAYER_COLORS } from "../constants"

interface UseDragAndDropParams {
	keyframes: AnimationKeyframe[]
	setKeyframes: React.Dispatch<React.SetStateAction<AnimationKeyframe[]>>
	currentFrameIndex: number
	currentKeyframe: AnimationKeyframe
	svgRef: React.RefObject<SVGSVGElement | null>
	courtViewMode: CourtViewMode
	isPlaying: boolean
	selectedElements: ElementRef[]
	onDragStart?: () => void
	onBatchStart?: () => void
	onBatchEnd?: () => void
}

export function useDragAndDrop({
	keyframes,
	setKeyframes,
	currentFrameIndex,
	currentKeyframe,
	svgRef,
	courtViewMode,
	isPlaying,
	selectedElements,
	onDragStart,
	onBatchStart,
	onBatchEnd,
}: UseDragAndDropParams) {
	const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null)
	const [draggingBall, setDraggingBall] = useState(false)
	const [draggingEquipment, setDraggingEquipment] = useState<string | null>(null)
	const [draggedEquipmentType, setDraggedEquipmentType] = useState<EquipmentType | null>(null)
	const [draggingPlayerFromToolbox, setDraggingPlayerFromToolbox] = useState(false)

	// Group drag tracking
	const groupDrag = useRef(false)
	const lastDragPos = useRef<{ x: number; y: number } | null>(null)

	// Alt+Drag duplication tracking
	const altDuplicated = useRef(false)

	const onPlayerMouseDown = useCallback((e: React.MouseEvent, playerId: string) => {
		if (isPlaying) return
		e.preventDefault()
		onBatchStart?.()

		// Alt+Click: duplicate the player, then drag the original
		if (e.altKey && !altDuplicated.current) {
			altDuplicated.current = true
			const source = currentKeyframe.players.find((p) => p.id === playerId)
			if (source) {
				const cloneId = `p${Date.now()}-clone`
				const clone: PlayerPosition = {
					...source,
					id: cloneId,
					firstFrameIndex: currentFrameIndex,
				}
				setKeyframes((prev) =>
					prev.map((frame, index) => {
						if (index < currentFrameIndex) return frame
						return { ...frame, players: [...frame.players, { ...clone }] }
					})
				)
			}
		}

		// Check if this element is part of the selection and Shift is held for group drag
		const isInSelection = selectedElements.some((el) => el.type === "player" && el.id === playerId)
		if (e.shiftKey && isInSelection && selectedElements.length > 1) {
			groupDrag.current = true
			const player = currentKeyframe.players.find((p) => p.id === playerId)
			if (player) {
				const coords = getSVGCoordinates(e, svgRef, courtViewMode)
				lastDragPos.current = coords || { x: player.x, y: player.y }
			}
		} else {
			groupDrag.current = false
			lastDragPos.current = null
		}

		setDraggingPlayer(playerId)
		onDragStart?.()
	}, [isPlaying, onDragStart, onBatchStart, currentKeyframe, currentFrameIndex, selectedElements, courtViewMode])

	const onBallMouseDown = useCallback((e: React.MouseEvent) => {
		if (isPlaying) return
		e.preventDefault()
		onBatchStart?.()
		groupDrag.current = false
		lastDragPos.current = null
		setDraggingBall(true)
		onDragStart?.()
	}, [isPlaying, onDragStart, onBatchStart])

	const onEquipmentMouseDown = useCallback((e: React.MouseEvent, equipmentId: string) => {
		if (isPlaying) return
		e.preventDefault()
		onBatchStart?.()

		// Alt+Click: duplicate the equipment, then drag the original
		if (e.altKey && !altDuplicated.current) {
			altDuplicated.current = true
			const source = (currentKeyframe.equipment || []).find((eq) => eq.id === equipmentId)
			if (source) {
				const cloneId = `eq-${Date.now()}-clone`
				const clone: EquipmentItem = {
					...source,
					id: cloneId,
					firstFrameIndex: currentFrameIndex,
				}
				setKeyframes((prev) =>
					prev.map((frame, index) => {
						if (index < currentFrameIndex) return frame
						return { ...frame, equipment: [...(frame.equipment || []), { ...clone }] }
					})
				)
			}
		}

		// Check if this element is part of the selection and Shift is held for group drag
		const isInSelection = selectedElements.some((el) => el.type === "equipment" && el.id === equipmentId)
		if (e.shiftKey && isInSelection && selectedElements.length > 1) {
			groupDrag.current = true
			const coords = getSVGCoordinates(e, svgRef, courtViewMode)
			if (coords) lastDragPos.current = coords
		} else {
			groupDrag.current = false
			lastDragPos.current = null
		}

		setDraggingEquipment(equipmentId)
		onDragStart?.()
	}, [isPlaying, onDragStart, onBatchStart, currentKeyframe, currentFrameIndex, selectedElements, courtViewMode])

	const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		if (!draggingPlayer && !draggingBall && !draggingEquipment) return

		const coords = getSVGCoordinates(e, svgRef, courtViewMode)
		if (!coords) return
		const { x, y } = coords

		// Group drag: move all selected elements by delta
		if (groupDrag.current && lastDragPos.current) {
			const dx = x - lastDragPos.current.x
			const dy = y - lastDragPos.current.y
			lastDragPos.current = { x, y }

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
			return
		}

		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index !== currentFrameIndex) return frame

				if (draggingPlayer) {
					return {
						...frame,
						players: frame.players.map((p) => (p.id === draggingPlayer ? { ...p, x, y } : p)),
					}
				}

				if (draggingBall) {
					return { ...frame, ball: { x, y } }
				}

				if (draggingEquipment) {
					return {
						...frame,
						equipment: (frame.equipment || []).map((eq) =>
							eq.id === draggingEquipment ? { ...eq, x, y } : eq
						),
					}
				}

				return frame
			})
		)
	}, [draggingPlayer, draggingBall, draggingEquipment, currentFrameIndex, courtViewMode, selectedElements])

	const onMouseUp = useCallback(() => {
		setDraggingPlayer(null)
		setDraggingBall(false)
		setDraggingEquipment(null)
		groupDrag.current = false
		lastDragPos.current = null
		altDuplicated.current = false
		onBatchEnd?.()
	}, [onBatchEnd])

	const onDragOver = useCallback((e: React.DragEvent<SVGSVGElement>) => {
		e.preventDefault()
	}, [])

	const onDrop = useCallback((e: React.DragEvent<SVGSVGElement>) => {
		e.preventDefault()

		const coords = getSVGCoordinates(e, svgRef, courtViewMode)
		if (!coords) return
		const { x, y } = coords

		// Handle player drop from toolbox
		if (draggingPlayerFromToolbox && !isPlaying) {
			const newPlayerId = `p${Date.now()}`
			const newPlayerIndex = currentKeyframe.players.length
			const newPlayer: PlayerPosition = {
				id: newPlayerId,
				x,
				y,
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
			setDraggingPlayerFromToolbox(false)
			return
		}

		// Handle equipment drop from toolbox
		if (!draggedEquipmentType || isPlaying) {
			setDraggedEquipmentType(null)
			return
		}

		const newEquipment: EquipmentItem = {
			id: `eq-${Date.now()}`,
			type: draggedEquipmentType,
			x,
			y,
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

		setDraggedEquipmentType(null)
	}, [draggedEquipmentType, draggingPlayerFromToolbox, currentFrameIndex, courtViewMode, isPlaying, currentKeyframe])

	const onToolboxEquipmentDrag = useCallback((type: EquipmentType) => {
		setDraggedEquipmentType(type)
		setDraggingPlayerFromToolbox(false)
	}, [])

	const onToolboxPlayerDrag = useCallback(() => {
		setDraggingPlayerFromToolbox(true)
		setDraggedEquipmentType(null)
	}, [])

	return {
		draggingPlayer,
		draggingBall,
		draggingEquipment,
		draggedEquipmentType,
		draggingPlayerFromToolbox,
		onPlayerMouseDown,
		onBallMouseDown,
		onEquipmentMouseDown,
		onMouseMove,
		onMouseUp,
		onDragOver,
		onDrop,
		onToolboxEquipmentDrag,
		onToolboxPlayerDrag,
	}
}
