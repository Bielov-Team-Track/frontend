"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Plus,
	Trash2,
	Save,
	ChevronDown,
	ChevronRight,
	Keyboard,
} from "lucide-react"
import type { CourtViewMode, AnimationKeyframe } from "../types"
import { EQUIPMENT_DEFINITIONS } from "../types"
import type { AnimationEditorProps } from "./types"
import { getInterpolatedState } from "./utils/interpolation"
import { getSVGCoordinates } from "./utils/coordinates"
import { COURT_WIDTH, COURT_HEIGHT, COURT_PADDING } from "./constants"
import { useFrameManager } from "./hooks/useFrameManager"
import { useAnimationPlayback } from "./hooks/useAnimationPlayback"
import { useDragAndDrop } from "./hooks/useDragAndDrop"
import { useElementCrud } from "./hooks/useElementCrud"
import { usePopups } from "./hooks/usePopups"
import { useUndoRedo } from "./hooks/useUndoRedo"
import { useMultiSelect } from "./hooks/useMultiSelect"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { useMarqueeSelect } from "./hooks/useMarqueeSelect"
import {
	InstructionsPanel,
	EquipmentToolbox,
	CourtViewSelector,
	ElementsPanel,
	ContextMenu,
	LabelEditor,
	NoteEditor,
	EquipmentRenderer,
	PlayerRenderer,
	BallRenderer,
	CourtCanvas,
	PlaybackControls,
	ShortcutLegend,
} from "./components"

/**
 * Vertical frame thumbnail for the right sidebar.
 */
function VerticalFrameThumb({
	frame,
	index,
	isActive,
	isPlaying,
	courtViewMode,
	onClick,
}: {
	frame: AnimationKeyframe
	index: number
	isActive: boolean
	isPlaying: boolean
	courtViewMode: CourtViewMode
	onClick: () => void
}) {
	return (
		<button
			onClick={onClick}
			disabled={isPlaying}
			className={`w-full p-1.5 rounded-lg border-2 transition-all ${
				isActive
					? "border-blue-500 bg-blue-500/10"
					: "border-border hover:border-muted-foreground"
			}`}
		>
			<div className="relative">
				<svg
					viewBox={courtViewMode === "half"
						? `0 ${COURT_HEIGHT / 2} ${COURT_WIDTH} ${COURT_HEIGHT / 2}`
						: `0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`
					}
					width="100%"
					height={courtViewMode === "half" ? 48 : 80}
					className={courtViewMode === "empty" ? "bg-slate-700 rounded" : "bg-green-800 rounded"}
				>
					{courtViewMode !== "empty" && (
						<>
							<rect x={COURT_PADDING} y={COURT_PADDING} width={COURT_WIDTH - COURT_PADDING * 2} height={COURT_HEIGHT - COURT_PADDING * 2} fill="none" stroke="white" strokeWidth="2" />
							<line x1={COURT_PADDING} y1={COURT_HEIGHT / 2} x2={COURT_WIDTH - COURT_PADDING} y2={COURT_HEIGHT / 2} stroke="white" strokeWidth="2" />
						</>
					)}
					{(frame.equipment || []).map((eq) => (
						<circle key={eq.id} cx={eq.x} cy={eq.y} r="8" fill={EQUIPMENT_DEFINITIONS[eq.type].color} />
					))}
					{frame.players.map((player) => (
						<circle key={player.id} cx={player.x} cy={player.y} r="12" fill={player.color} />
					))}
					<circle cx={frame.ball.x} cy={frame.ball.y} r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
				</svg>
				<span className="absolute bottom-0.5 right-0.5 bg-gray-800/80 text-white text-[10px] leading-none px-1 py-0.5 rounded">
					{index + 1}
				</span>
			</div>
		</button>
	)
}

export function AnimationEditor({ initialAnimation, onSave, onCancel, isSaving = false }: AnimationEditorProps) {
	const svgRef = useRef<SVGSVGElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	const [animationName, setAnimationName] = useState(initialAnimation?.name || "")
	const [courtViewMode, setCourtViewMode] = useState<CourtViewMode>("full")
	const [infoCollapsed, setInfoCollapsed] = useState(false)
	const [framesCollapsed, setFramesCollapsed] = useState(false)
	const [showShortcutLegend, setShowShortcutLegend] = useState(false)

	const frames = useFrameManager(initialAnimation)
	const undoRedo = useUndoRedo(frames.keyframes, frames.setKeyframes)
	const playback = useAnimationPlayback(frames.keyframes.length, initialAnimation?.speed || 1000)
	const selection = useMultiSelect()

	const handleDragStart = useCallback(() => {
		popups.closeAll()
	}, [])

	const drag = useDragAndDrop({
		keyframes: frames.keyframes,
		setKeyframes: undoRedo.setKeyframes,
		currentFrameIndex: frames.currentFrameIndex,
		currentKeyframe: frames.currentKeyframe,
		svgRef,
		courtViewMode,
		isPlaying: playback.isPlaying,
		onDragStart: handleDragStart,
		onBatchStart: undoRedo.beginBatch,
		onBatchEnd: undoRedo.commitBatch,
	})
	const elements = useElementCrud({
		keyframes: frames.keyframes,
		setKeyframes: undoRedo.setKeyframes,
		currentFrameIndex: frames.currentFrameIndex,
		currentKeyframe: frames.currentKeyframe,
		isPlaying: playback.isPlaying,
	})
	const popups = usePopups({ containerRef })

	const marquee = useMarqueeSelect({
		currentKeyframe: frames.currentKeyframe,
		setSelection: selection.setSelection,
	})

	const { frame, playerScales, equipmentScales } = useMemo(
		() => playback.isPlaying
			? getInterpolatedState(frames.keyframes, playback.playbackProgress)
			: { frame: frames.currentKeyframe, playerScales: {}, equipmentScales: {} },
		[playback.isPlaying, frames.keyframes, frames.currentKeyframe, playback.playbackProgress]
	)
	const displayState = playback.isPlaying ? frame : frames.currentKeyframe

	const handleGoToFrame = useCallback((index: number) => {
		frames.setCurrentFrameIndex(index)
		playback.setIsPlaying(false)
		playback.setPlaybackProgress(0)
	}, [])

	const handleReset = useCallback(() => {
		playback.setIsPlaying(false)
		playback.setPlaybackProgress(0)
		frames.setCurrentFrameIndex(0)
	}, [])

	const handleSave = useCallback(() => {
		onSave?.({ name: animationName || undefined, keyframes: frames.keyframes, speed: playback.animationSpeed })
	}, [onSave, animationName, frames.keyframes, playback.animationSpeed])

	const handlePrevFrame = useCallback(() => {
		if (frames.currentFrameIndex > 0) {
			handleGoToFrame(frames.currentFrameIndex - 1)
		}
	}, [handleGoToFrame, frames.currentFrameIndex])

	const handleNextFrame = useCallback(() => {
		if (frames.currentFrameIndex < frames.keyframes.length - 1) {
			handleGoToFrame(frames.currentFrameIndex + 1)
		}
	}, [handleGoToFrame, frames.currentFrameIndex, frames.keyframes.length])

	const handleFirstFrame = useCallback(() => {
		handleGoToFrame(0)
	}, [handleGoToFrame])

	const handleLastFrame = useCallback(() => {
		handleGoToFrame(frames.keyframes.length - 1)
	}, [handleGoToFrame, frames.keyframes.length])

	const handleToggleInfo = useCallback(() => {
		setInfoCollapsed(prev => !prev)
	}, [])

	// Track selection when mousedown on player/equipment (with Shift for additive)
	const handlePlayerMouseDown = useCallback((e: React.MouseEvent, playerId: string) => {
		selection.select({ type: "player", id: playerId }, e.shiftKey)
		drag.onPlayerMouseDown(e, playerId)
	}, [drag.onPlayerMouseDown, selection.select])

	const handleEquipmentMouseDown = useCallback((e: React.MouseEvent, equipmentId: string) => {
		selection.select({ type: "equipment", id: equipmentId }, e.shiftKey)
		drag.onEquipmentMouseDown(e, equipmentId)
	}, [drag.onEquipmentMouseDown, selection.select])

	// Background click: start marquee (Shift) or deselect
	const handleBackgroundClick = useCallback(() => {
		selection.deselectAll()
		popups.closeAll()
	}, [selection.deselectAll, popups.closeAll])

	// SVG mouse handlers that also handle marquee
	const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		if (marquee.isMarqueing) {
			const coords = getSVGCoordinates(e, svgRef, courtViewMode)
			if (coords) marquee.onMarqueeMove(coords.x, coords.y)
			return
		}
		drag.onMouseMove(e)
	}, [marquee.isMarqueing, marquee.onMarqueeMove, drag.onMouseMove, courtViewMode])

	const handleSvgMouseUp = useCallback(() => {
		if (marquee.isMarqueing) {
			marquee.onMarqueeEnd()
			return
		}
		drag.onMouseUp()
	}, [marquee.isMarqueing, marquee.onMarqueeEnd, drag.onMouseUp])

	// Called by CourtCanvas only when mousedown hits background
	const handleBackgroundMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
		if (!e.shiftKey || playback.isPlaying) return
		const coords = getSVGCoordinates(e, svgRef, courtViewMode)
		if (coords) {
			e.preventDefault()
			marquee.onMarqueeStart(coords.x, coords.y)
		}
	}, [playback.isPlaying, courtViewMode, marquee.onMarqueeStart])

	// Keyboard shortcut action callbacks
	const handleSelectAll = useCallback(() => {
		const all = [
			...frames.currentKeyframe.players.map((p) => ({ type: "player" as const, id: p.id })),
			...(frames.currentKeyframe.equipment || []).map((eq) => ({ type: "equipment" as const, id: eq.id })),
		]
		selection.selectAll(all)
	}, [frames.currentKeyframe, selection.selectAll])

	const handleDeleteSelected = useCallback(() => {
		elements.deleteSelected(selection.selectedElements)
		selection.deselectAll()
	}, [elements.deleteSelected, selection.selectedElements, selection.deselectAll])

	const handleDuplicateSelected = useCallback(() => {
		elements.duplicateSelected(selection.selectedElements)
	}, [elements.duplicateSelected, selection.selectedElements])

	const handleCopyPositions = useCallback(() => {
		elements.copyPositions(selection.selectedElements)
	}, [elements.copyPositions, selection.selectedElements])

	const handleNudge = useCallback((dx: number, dy: number) => {
		elements.nudge(selection.selectedElements, dx, dy)
	}, [elements.nudge, selection.selectedElements])

	const handleSwapPlayers = useCallback(() => {
		const players = selection.selectedElements.filter((el) => el.type === "player")
		if (players.length === 2) {
			elements.swapPlayers(players[0].id, players[1].id)
		}
	}, [selection.selectedElements, elements.swapPlayers])

	// Wire central keyboard shortcuts
	useKeyboardShortcuts({
		isPlaying: playback.isPlaying,
		hasSelection: selection.hasSelection,
		selectedElements: selection.selectedElements,
		togglePlay: playback.togglePlay,
		prevFrame: handlePrevFrame,
		nextFrame: handleNextFrame,
		firstFrame: handleFirstFrame,
		lastFrame: handleLastFrame,
		undo: undoRedo.undo,
		redo: undoRedo.redo,
		selectAll: handleSelectAll,
		deselectAll: selection.deselectAll,
		deleteSelected: handleDeleteSelected,
		duplicateSelected: handleDuplicateSelected,
		copyPositions: handleCopyPositions,
		pastePositions: elements.pastePositions,
		nudge: handleNudge,
		addKeyframe: frames.addKeyframe,
		mirrorFormation: elements.mirrorFormation,
		swapPlayers: handleSwapPlayers,
		closePopups: popups.closeAll,
		openShortcutLegend: () => setShowShortcutLegend(true),
	})

	return (
		<div className="relative space-y-4" ref={containerRef}>
			{/* Top bar: Name + Save/Cancel + Shortcuts */}
			<div className="flex items-center gap-4 justify-between">
				<div className="flex-1 max-w-md">
					<Input
						value={animationName}
						onChange={(e) => setAnimationName(e.target.value)}
						placeholder="Animation name..."
						maxLength={100}
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setShowShortcutLegend(true)}
						title="Keyboard shortcuts (Ctrl+/ or ?)"
					>
						<Keyboard className="h-4 w-4" />
					</Button>
					{onCancel && (
						<Button variant="outline" size="sm" onClick={onCancel}>
							Cancel
						</Button>
					)}
					{onSave && (
						<Button
							onClick={handleSave}
							size="sm"
							className="bg-green-600 hover:bg-green-700"
							disabled={isSaving}
						>
							{isSaving ? (
								<><span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
							) : (
								<><Save className="h-4 w-4 mr-1" /> Save</>
							)}
						</Button>
					)}
				</div>
			</div>

			<InstructionsPanel collapsed={infoCollapsed} onToggle={handleToggleInfo} />

			{/* Playback controls — original position above the court */}
			<PlaybackControls
				isPlaying={playback.isPlaying}
				animationSpeed={playback.animationSpeed}
				frameCount={frames.keyframes.length}
				currentFrameIndex={frames.currentFrameIndex}
				onTogglePlay={playback.togglePlay}
				onReset={handleReset}
				onPrevFrame={handlePrevFrame}
				onNextFrame={handleNextFrame}
				onSpeedChange={playback.setAnimationSpeed}
			/>

			{/* Main layout: Toolbox/Elements + Court + Frame Sidebar */}
			<div className="flex gap-4 justify-center items-start">
				{/* Left column: Toolbox + Elements */}
				<div className="flex flex-col gap-3">
					<div className="h-[34px]" />
					<EquipmentToolbox
						isPlaying={playback.isPlaying}
						currentFrameIndex={frames.currentFrameIndex}
						onEquipmentDrag={drag.onToolboxEquipmentDrag}
						onPlayerDrag={drag.onToolboxPlayerDrag}
						onEquipmentClick={elements.addEquipment}
						onPlayerClick={elements.addPlayer}
					/>
					<ElementsPanel
						players={displayState.players}
						equipment={displayState.equipment || []}
						isPlaying={playback.isPlaying}
						onDeletePlayer={elements.deletePlayer}
						onDeleteEquipment={elements.deleteEquipment}
					/>
				</div>

				{/* Center: Court */}
				<div className="flex flex-col gap-2">
					<CourtViewSelector value={courtViewMode} onChange={setCourtViewMode} />
					<CourtCanvas
						svgRef={svgRef}
						viewMode={courtViewMode}
						onMouseMove={handleSvgMouseMove}
						onMouseUp={handleSvgMouseUp}
						onMouseLeave={handleSvgMouseUp}
						onDragOver={drag.onDragOver}
						onDrop={drag.onDrop}
						onBackgroundClick={handleBackgroundClick}
						onBackgroundMouseDown={handleBackgroundMouseDown}
						marqueeRect={marquee.marqueeRect}
					>
							{(displayState.equipment || []).map((item) => (
								<EquipmentRenderer
									key={item.id}
									item={item}
									scale={playback.isPlaying ? (equipmentScales[item.id] ?? 1) : 1}
									isDragging={drag.draggingEquipment === item.id}
									isSelected={selection.selectedIds.has(item.id)}
									isPlaying={playback.isPlaying}
									currentFrameIndex={frames.currentFrameIndex}
									onMouseDown={handleEquipmentMouseDown}
									onContextMenu={popups.openContextMenu}
									onDoubleClick={popups.openLabelEditorFromDoubleClick}
									onDelete={elements.deleteEquipment}
									onDeleteNote={(id) => elements.updateNote("equipment", id, "")}
								/>
							))}
							{displayState.players.map((player) => (
								<PlayerRenderer
									key={player.id}
									player={player}
									scale={playback.isPlaying ? (playerScales[player.id] ?? 1) : 1}
									isDragging={drag.draggingPlayer === player.id}
									isSelected={selection.selectedIds.has(player.id)}
									isPlaying={playback.isPlaying}
									currentFrameIndex={frames.currentFrameIndex}
									canDelete={frames.currentKeyframe.players.length > 1}
									onMouseDown={handlePlayerMouseDown}
									onContextMenu={popups.openContextMenu}
									onDoubleClick={popups.openLabelEditorFromDoubleClick}
									onDelete={elements.deletePlayer}
									onDeleteNote={(id) => elements.updateNote("player", id, "")}
								/>
							))}
							<BallRenderer
								ball={displayState.ball}
								isDragging={drag.draggingBall}
								isPlaying={playback.isPlaying}
								onMouseDown={drag.onBallMouseDown}
							/>
						</CourtCanvas>
				</div>

				{/* Right sidebar: Frames only */}
				<div className="flex flex-col gap-2 w-28 flex-shrink-0">
					{/* Collapsible header */}
					<button
						onClick={() => setFramesCollapsed(prev => !prev)}
						className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 hover:text-foreground transition-colors"
					>
						{framesCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
						Frames
						<span className="ml-auto text-[10px]">{frames.currentFrameIndex + 1}/{frames.keyframes.length}</span>
					</button>

					{!framesCollapsed && (
						<>
							{/* Frame list */}
							<div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
								{frames.keyframes.map((kf, index) => (
									<VerticalFrameThumb
										key={kf.id}
										frame={kf}
										index={index}
										isActive={index === frames.currentFrameIndex}
										isPlaying={playback.isPlaying}
										courtViewMode={courtViewMode}
										onClick={() => handleGoToFrame(index)}
									/>
								))}
							</div>

							{/* Add / Delete buttons */}
							<div className="flex gap-1">
								<Button
									variant="outline"
									size="sm"
									className="flex-1 h-7 text-xs"
									onClick={frames.addKeyframe}
									disabled={playback.isPlaying}
								>
									<Plus className="h-3 w-3 mr-0.5" /> Add
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="h-7 w-7 text-red-600 hover:text-red-700 p-0"
									onClick={frames.deleteKeyframe}
									disabled={playback.isPlaying || frames.keyframes.length <= 1}
								>
									<Trash2 className="h-3 w-3" />
								</Button>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Popups */}
			{popups.contextMenu && (
				<ContextMenu
					state={popups.contextMenu}
					onClose={popups.closeContextMenu}
					onEditLabel={popups.openLabelEditorFromMenu}
					onEditNote={popups.openNoteEditor}
				/>
			)}
			{popups.editingLabel && (() => {
				const { elementType, elementId } = popups.editingLabel
				return (
					<LabelEditor
						state={popups.editingLabel}
						onClose={popups.closeLabel}
						onSave={(newLabel) => elements.updateLabel(elementType, elementId, newLabel)}
					/>
				)
			})()}
			{popups.editingNote && (() => {
				const { elementType, elementId } = popups.editingNote
				return (
					<NoteEditor
						state={popups.editingNote}
						onClose={popups.closeNote}
						onSave={(newNote) => elements.updateNote(elementType, elementId, newNote)}
					/>
				)
			})()}

			{/* Shortcut Legend Modal */}
			<ShortcutLegend open={showShortcutLegend} onOpenChange={setShowShortcutLegend} />
		</div>
	)
}
