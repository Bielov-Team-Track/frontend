import { useState, useCallback, useRef } from "react"
import type { AnimationKeyframe, EquipmentType, PlayerPosition, EquipmentItem, CourtViewMode } from "../../types"
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
	onDragStart,
	onBatchStart,
	onBatchEnd,
}: UseDragAndDropParams) {
	const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null)
	const [draggingBall, setDraggingBall] = useState(false)
	const [draggingEquipment, setDraggingEquipment] = useState<string | null>(null)
	const [draggedEquipmentType, setDraggedEquipmentType] = useState<EquipmentType | null>(null)
	const [draggingPlayerFromToolbox, setDraggingPlayerFromToolbox] = useState(false)

	// Shift+Drag axis constraint refs
	const dragStartPos = useRef<{ x: number; y: number } | null>(null)
	const axisLock = useRef<"h" | "v" | null>(null)

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

		// Capture start position for axis-lock
		const player = currentKeyframe.players.find((p) => p.id === playerId)
		if (player) {
			dragStartPos.current = { x: player.x, y: player.y }
		}
		axisLock.current = null

		setDraggingPlayer(playerId)
		onDragStart?.()
	}, [isPlaying, onDragStart, onBatchStart, currentKeyframe, currentFrameIndex])

	const onBallMouseDown = useCallback((e: React.MouseEvent) => {
		if (isPlaying) return
		e.preventDefault()
		onBatchStart?.()

		dragStartPos.current = { x: currentKeyframe.ball.x, y: currentKeyframe.ball.y }
		axisLock.current = null

		setDraggingBall(true)
		onDragStart?.()
	}, [isPlaying, onDragStart, onBatchStart, currentKeyframe])

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

		// Capture start position for axis-lock
		const eq = (currentKeyframe.equipment || []).find((e) => e.id === equipmentId)
		if (eq) {
			dragStartPos.current = { x: eq.x, y: eq.y }
		}
		axisLock.current = null

		setDraggingEquipment(equipmentId)
		onDragStart?.()
	}, [isPlaying, onDragStart, onBatchStart, currentKeyframe, currentFrameIndex])

	const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		if (!draggingPlayer && !draggingBall && !draggingEquipment) return

		const coords = getSVGCoordinates(e, svgRef, courtViewMode)
		if (!coords) return
		let { x, y } = coords

		// Shift+Drag: constrain to H/V axis
		if (e.shiftKey && dragStartPos.current) {
			const dx = Math.abs(x - dragStartPos.current.x)
			const dy = Math.abs(y - dragStartPos.current.y)

			// Determine axis after 5px of movement
			if (!axisLock.current && (dx > 5 || dy > 5)) {
				axisLock.current = dx > dy ? "h" : "v"
			}

			if (axisLock.current === "h") {
				y = dragStartPos.current.y
			} else if (axisLock.current === "v") {
				x = dragStartPos.current.x
			}
		} else {
			// Reset axis lock when shift released
			axisLock.current = null
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
	}, [draggingPlayer, draggingBall, draggingEquipment, currentFrameIndex, courtViewMode])

	const onMouseUp = useCallback(() => {
		setDraggingPlayer(null)
		setDraggingBall(false)
		setDraggingEquipment(null)
		dragStartPos.current = null
		axisLock.current = null
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
