import { useCallback, useRef } from "react"
import type { AnimationKeyframe } from "../../types"

const MAX_HISTORY = 50

export function useUndoRedo(
	keyframes: AnimationKeyframe[],
	rawSetKeyframes: React.Dispatch<React.SetStateAction<AnimationKeyframe[]>>
) {
	const undoStack = useRef<AnimationKeyframe[][]>([])
	const redoStack = useRef<AnimationKeyframe[][]>([])
	const isBatching = useRef(false)
	const batchSnapshot = useRef<AnimationKeyframe[] | null>(null)

	const pushUndo = useCallback((snapshot: AnimationKeyframe[]) => {
		undoStack.current = undoStack.current.slice(-(MAX_HISTORY - 1))
		undoStack.current.push(snapshot)
		redoStack.current = []
	}, [])

	/** Drop-in replacement for setKeyframes that records undo history. */
	const setKeyframes: React.Dispatch<React.SetStateAction<AnimationKeyframe[]>> = useCallback(
		(action) => {
			rawSetKeyframes((prev) => {
				const next = typeof action === "function" ? action(prev) : action
				// During a batch (drag), don't push per-move — only on commit
				if (!isBatching.current) {
					pushUndo(prev)
				}
				return next
			})
		},
		[rawSetKeyframes, pushUndo]
	)

	/** Call on mousedown before a drag starts. */
	const beginBatch = useCallback(() => {
		isBatching.current = true
		// We need to read keyframes synchronously via a ref-like getter,
		// but since the caller passes current keyframes we snapshot them.
		// Actually, we'll use rawSetKeyframes to capture current state.
		rawSetKeyframes((current) => {
			batchSnapshot.current = current
			return current // no change
		})
	}, [rawSetKeyframes])

	/** Call on mouseup after a drag ends. Pushes one undo entry for the whole drag. */
	const commitBatch = useCallback(() => {
		if (isBatching.current && batchSnapshot.current) {
			pushUndo(batchSnapshot.current)
			batchSnapshot.current = null
		}
		isBatching.current = false
	}, [pushUndo])

	const undo = useCallback(() => {
		const stack = undoStack.current
		if (stack.length === 0) return

		const previous = stack.pop()!
		rawSetKeyframes((current) => {
			redoStack.current.push(current)
			return previous
		})
	}, [rawSetKeyframes])

	const redo = useCallback(() => {
		const stack = redoStack.current
		if (stack.length === 0) return

		const next = stack.pop()!
		rawSetKeyframes((current) => {
			undoStack.current.push(current)
			return next
		})
	}, [rawSetKeyframes])

	const canUndo = undoStack.current.length > 0
	const canRedo = redoStack.current.length > 0

	return { setKeyframes, undo, redo, canUndo, canRedo, beginBatch, commitBatch }
}
