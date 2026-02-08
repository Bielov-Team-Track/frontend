import { useState, useCallback, type RefObject } from "react"
import type { ContextMenuState, EditingLabelState, EditingNoteState } from "../types"

export function usePopups({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
	const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
	const [editingLabel, setEditingLabel] = useState<EditingLabelState | null>(null)
	const [editingNote, setEditingNote] = useState<EditingNoteState | null>(null)

	// containerRef is stable (ref object never changes), so deps = []
	const openContextMenu = useCallback((
		elementType: "player" | "equipment",
		elementId: string,
		currentLabel: string,
		currentNote: string,
		clientX: number,
		clientY: number
	) => {
		const rect = containerRef.current?.getBoundingClientRect()
		if (!rect) return
		let x = clientX - rect.left + 10
		let y = clientY - rect.top + 10
		x = Math.min(x, rect.width - 180)
		y = Math.min(y, rect.height - 100)
		x = Math.max(10, x)
		y = Math.max(10, y)
		setContextMenu({ elementType, elementId, currentLabel, currentNote, position: { x, y } })
	}, [])

	// From context menu - 0 params, reads contextMenu state directly, re-clamps for larger popup
	const openLabelEditorFromMenu = useCallback(() => {
		if (!contextMenu) return
		const rect = containerRef.current?.getBoundingClientRect()
		if (!rect) return
		let x = Math.min(contextMenu.position.x, rect.width - 240)
		let y = Math.min(contextMenu.position.y, rect.height - 300)
		x = Math.max(10, x)
		y = Math.max(10, y)
		setEditingLabel({
			elementType: contextMenu.elementType,
			elementId: contextMenu.elementId,
			currentLabel: contextMenu.currentLabel,
			position: { x, y },
		})
		setContextMenu(null)
	}, [contextMenu])

	// From double-click - raw client coordinates
	const openLabelEditorFromDoubleClick = useCallback((
		elementType: "player" | "equipment",
		elementId: string,
		currentLabel: string,
		clientX: number,
		clientY: number
	) => {
		const rect = containerRef.current?.getBoundingClientRect()
		if (!rect) return
		let x = clientX - rect.left + 10
		let y = clientY - rect.top + 10
		x = Math.min(x, rect.width - 240)
		y = Math.min(y, rect.height - 300)
		x = Math.max(10, x)
		y = Math.max(10, y)
		setEditingLabel({ elementType, elementId, currentLabel, position: { x, y } })
	}, [])

	// From context menu only - 0 params, reads contextMenu state directly
	const openNoteEditor = useCallback(() => {
		if (!contextMenu) return
		const rect = containerRef.current?.getBoundingClientRect()
		if (!rect) return
		let x = Math.min(contextMenu.position.x, rect.width - 250)
		let y = Math.min(contextMenu.position.y, rect.height - 200)
		x = Math.max(10, x)
		y = Math.max(10, y)
		setEditingNote({
			elementType: contextMenu.elementType,
			elementId: contextMenu.elementId,
			currentNote: contextMenu.currentNote,
			position: { x, y },
		})
		setContextMenu(null)
	}, [contextMenu])

	const closeContextMenu = useCallback(() => {
		setContextMenu(null)
	}, [])

	const closeLabel = useCallback(() => {
		setEditingLabel(null)
	}, [])

	const closeNote = useCallback(() => {
		setEditingNote(null)
	}, [])

	const closeAll = useCallback(() => {
		setContextMenu(null)
		setEditingLabel(null)
		setEditingNote(null)
	}, [])

	return {
		contextMenu,
		closeContextMenu,
		editingLabel,
		closeLabel,
		editingNote,
		closeNote,
		openContextMenu,
		openLabelEditorFromMenu,
		openLabelEditorFromDoubleClick,
		openNoteEditor,
		closeAll,
	}
}
