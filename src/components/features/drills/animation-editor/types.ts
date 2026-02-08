// Animation Editor internal types

import type { AnimationKeyframe, DrillAnimation } from "../types"

export interface ContextMenuState {
	elementType: "player" | "equipment"
	elementId: string
	currentLabel: string
	currentNote: string
	position: { x: number; y: number }
}

export interface EditingLabelState {
	elementType: "player" | "equipment"
	elementId: string
	currentLabel: string
	position: { x: number; y: number }
}

export interface EditingNoteState {
	elementType: "player" | "equipment"
	elementId: string
	currentNote: string
	position: { x: number; y: number }
}

export interface InterpolatedState {
	frame: AnimationKeyframe
	playerScales: Record<string, number>
	equipmentScales: Record<string, number>
}

export interface AnimationEditorProps {
	initialAnimation?: DrillAnimation
	onSave?: (animation: DrillAnimation) => void
	onCancel?: () => void
	isSaving?: boolean
}
