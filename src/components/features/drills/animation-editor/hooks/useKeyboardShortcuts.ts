import { useEffect } from "react"
import type { ElementRef } from "./useMultiSelect"

export interface ShortcutEntry {
	keys: string
	description: string
	group: string
}

export const SHORTCUT_LEGEND: ShortcutEntry[] = [
	// Playback
	{ keys: "Space", description: "Play / Pause", group: "Playback" },
	// Navigation
	{ keys: "↑", description: "Previous frame", group: "Navigation" },
	{ keys: "↓", description: "Next frame", group: "Navigation" },
	{ keys: "Shift+↑", description: "First frame", group: "Navigation" },
	{ keys: "Shift+↓", description: "Last frame", group: "Navigation" },
	// Selection
	{ keys: "Ctrl+A", description: "Select all elements", group: "Selection" },
	{ keys: "Escape", description: "Deselect all / Close popups", group: "Selection" },
	{ keys: "Shift+Click", description: "Add to selection", group: "Selection" },
	{ keys: "Click+Drag", description: "Area select (on background)", group: "Selection" },
	// Editing
	{ keys: "Delete / Backspace", description: "Delete selected", group: "Editing" },
	{ keys: "Ctrl+Z", description: "Undo", group: "Editing" },
	{ keys: "Ctrl+Y", description: "Redo", group: "Editing" },
	{ keys: "Ctrl+Shift+Z", description: "Redo", group: "Editing" },
	{ keys: "Ctrl+D", description: "Duplicate selected", group: "Editing" },
	{ keys: "Ctrl+C", description: "Copy selected elements", group: "Editing" },
	{ keys: "Ctrl+V", description: "Paste elements", group: "Editing" },
	{ keys: "Ctrl+S", description: "Save animation", group: "Editing" },
	// Animation
	{ keys: "K", description: "Add keyframe", group: "Animation" },
	// Sport
	{ keys: "M", description: "Mirror formation", group: "Sport" },
	{ keys: "S", description: "Swap two selected players", group: "Sport" },
	// Help
	{ keys: "Ctrl+/ or ?", description: "Show keyboard shortcuts", group: "Help" },
]

interface UseKeyboardShortcutsParams {
	isPlaying: boolean
	hasSelection: boolean
	selectedElements: ElementRef[]
	// Playback
	togglePlay: () => void
	// Navigation
	prevFrame: () => void
	nextFrame: () => void
	firstFrame: () => void
	lastFrame: () => void
	// Undo/Redo
	undo: () => void
	redo: () => void
	// Selection
	selectAll: () => void
	deselectAll: () => void
	// Editing
	deleteSelected: () => void
	duplicateSelected: () => void
	copyElements: () => void
	pasteElements: () => void
	// Animation
	addKeyframe: () => void
	// Sport
	mirrorFormation: () => void
	swapPlayers: () => void
	// Save
	save: () => void
	// UI
	closePopups: () => void
	openShortcutLegend: () => void
}

export function useKeyboardShortcuts(params: UseKeyboardShortcutsParams) {
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const tag = (e.target as HTMLElement)?.tagName
			if (tag === "INPUT" || tag === "TEXTAREA") return
			if ((e.target as HTMLElement)?.isContentEditable) return

			const ctrl = e.ctrlKey || e.metaKey
			const shift = e.shiftKey
			const key = e.key

			// Space → toggle play
			if (key === " ") {
				e.preventDefault()
				params.togglePlay()
				return
			}

			// Ctrl+/ or ? → shortcut legend
			if ((ctrl && key === "/") || (key === "?" && !ctrl)) {
				e.preventDefault()
				params.openShortcutLegend()
				return
			}

			// Escape → deselect + close popups
			if (key === "Escape") {
				params.deselectAll()
				params.closePopups()
				return
			}

			// Ctrl+S → save
			if (ctrl && key === "s") {
				e.preventDefault()
				params.save()
				return
			}

			// Ctrl+Y → redo
			if (ctrl && key === "y") {
				e.preventDefault()
				params.redo()
				return
			}

			// Ctrl+Shift+Z → redo
			if (ctrl && shift && key === "Z") {
				e.preventDefault()
				params.redo()
				return
			}

			// Ctrl+Z → undo
			if (ctrl && key === "z") {
				e.preventDefault()
				params.undo()
				return
			}

			// Ctrl+A → select all
			if (ctrl && key === "a") {
				if (params.isPlaying) return
				e.preventDefault()
				params.selectAll()
				return
			}

			// Ctrl+D → duplicate selected
			if (ctrl && key === "d") {
				if (!params.hasSelection || params.isPlaying) return
				e.preventDefault()
				params.duplicateSelected()
				return
			}

			// Ctrl+C → copy elements
			if (ctrl && key === "c") {
				if (params.isPlaying) return
				e.preventDefault()
				params.copyElements()
				return
			}

			// Ctrl+V → paste elements
			if (ctrl && key === "v") {
				if (params.isPlaying) return
				e.preventDefault()
				params.pasteElements()
				return
			}

			// Delete / Backspace → delete selected
			if (key === "Delete" || key === "Backspace") {
				if (!params.hasSelection || params.isPlaying) return
				e.preventDefault()
				params.deleteSelected()
				return
			}

			// Up/Down arrows: frame navigation
			if (key === "ArrowUp" || key === "ArrowDown") {
				if (params.isPlaying) return
				e.preventDefault()
				if (shift && key === "ArrowUp") params.firstFrame()
				else if (shift && key === "ArrowDown") params.lastFrame()
				else if (key === "ArrowUp") params.prevFrame()
				else if (key === "ArrowDown") params.nextFrame()
				return
			}

			// K → add keyframe
			if (key === "k" || key === "K") {
				if (params.isPlaying) return
				e.preventDefault()
				params.addKeyframe()
				return
			}

			// M → mirror formation
			if (key === "m" || key === "M") {
				if (params.isPlaying) return
				e.preventDefault()
				params.mirrorFormation()
				return
			}

			// S → swap two selected players
			if (key === "s" || key === "S") {
				if (params.isPlaying) return
				if (params.selectedElements.filter((el) => el.type === "player").length !== 2) return
				e.preventDefault()
				params.swapPlayers()
				return
			}
		}

		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [params])
}
