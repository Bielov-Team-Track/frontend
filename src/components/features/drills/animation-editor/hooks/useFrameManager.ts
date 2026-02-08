import { useState, useCallback, useMemo } from "react"
import type { AnimationKeyframe, DrillAnimation } from "../../types"
import { createInitialKeyframe } from "../utils/keyframes"

export function useFrameManager(initialAnimation?: DrillAnimation) {
	const [keyframes, setKeyframes] = useState<AnimationKeyframe[]>(
		initialAnimation?.keyframes || [createInitialKeyframe()]
	)
	const [currentFrameIndex, setCurrentFrameIndex] = useState(0)

	const currentKeyframe = useMemo(
		() => keyframes[currentFrameIndex],
		[keyframes, currentFrameIndex]
	)

	const addKeyframe = useCallback(() => {
		const newFrame: AnimationKeyframe = {
			...JSON.parse(JSON.stringify(currentKeyframe)),
			id: crypto.randomUUID(),
		}
		const newKeyframes = [
			...keyframes.slice(0, currentFrameIndex + 1),
			newFrame,
			...keyframes.slice(currentFrameIndex + 1),
		]
		setKeyframes(newKeyframes)
		setCurrentFrameIndex(currentFrameIndex + 1)
	}, [currentFrameIndex, currentKeyframe, keyframes])

	const deleteKeyframe = useCallback(() => {
		if (keyframes.length <= 1) return
		const newKeyframes = keyframes.filter((_, i) => i !== currentFrameIndex)
		setKeyframes(newKeyframes)
		setCurrentFrameIndex(Math.min(currentFrameIndex, newKeyframes.length - 1))
	}, [currentFrameIndex, keyframes])

	return {
		keyframes,
		setKeyframes,
		currentFrameIndex,
		setCurrentFrameIndex,
		currentKeyframe,
		addKeyframe,
		deleteKeyframe,
	}
}
