import { useState, useCallback, useMemo } from "react"

export interface ElementRef {
	type: "player" | "equipment"
	id: string
}

export function useMultiSelect() {
	const [selectedElements, setSelectedElements] = useState<ElementRef[]>([])

	const selectedIds = useMemo(
		() => new Set(selectedElements.map((el) => el.id)),
		[selectedElements]
	)

	/** Select a single element. If additive (Shift+Click), toggle it in the set. */
	const select = useCallback((ref: ElementRef, additive = false) => {
		setSelectedElements((prev) => {
			if (additive) {
				const exists = prev.find((el) => el.id === ref.id && el.type === ref.type)
				if (exists) {
					return prev.filter((el) => !(el.id === ref.id && el.type === ref.type))
				}
				return [...prev, ref]
			}
			return [ref]
		})
	}, [])

	/** Replace entire selection. */
	const setSelection = useCallback((refs: ElementRef[]) => {
		setSelectedElements(refs)
	}, [])

	/** Select all provided elements. */
	const selectAll = useCallback((refs: ElementRef[]) => {
		setSelectedElements(refs)
	}, [])

	const deselectAll = useCallback(() => {
		setSelectedElements([])
	}, [])

	const hasSelection = selectedElements.length > 0

	return {
		selectedElements,
		selectedIds,
		select,
		setSelection,
		selectAll,
		deselectAll,
		hasSelection,
	}
}
