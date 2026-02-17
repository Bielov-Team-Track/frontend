import { useState, useCallback, useRef } from "react"
import type { ElementRef } from "./useMultiSelect"
import type { AnimationKeyframe } from "../../types"

export interface MarqueeRect {
	x: number
	y: number
	width: number
	height: number
}

interface UseMarqueeSelectParams {
	currentKeyframe: AnimationKeyframe
	setSelection: (refs: ElementRef[]) => void
}

export function useMarqueeSelect({ currentKeyframe, setSelection }: UseMarqueeSelectParams) {
	const [marqueeRect, setMarqueeRect] = useState<MarqueeRect | null>(null)
	const startPoint = useRef<{ x: number; y: number } | null>(null)
	const isMarqueing = marqueeRect !== null

	const onMarqueeStart = useCallback((x: number, y: number) => {
		startPoint.current = { x, y }
		setMarqueeRect({ x, y, width: 0, height: 0 })
	}, [])

	const onMarqueeMove = useCallback((x: number, y: number) => {
		if (!startPoint.current) return
		const sx = startPoint.current.x
		const sy = startPoint.current.y
		setMarqueeRect({
			x: Math.min(sx, x),
			y: Math.min(sy, y),
			width: Math.abs(x - sx),
			height: Math.abs(y - sy),
		})
	}, [])

	const onMarqueeEnd = useCallback(() => {
		if (!marqueeRect || !startPoint.current) {
			startPoint.current = null
			setMarqueeRect(null)
			return
		}

		const rect = marqueeRect
		const hits: ElementRef[] = []

		// Check players
		for (const p of currentKeyframe.players) {
			if (p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height) {
				hits.push({ type: "player", id: p.id })
			}
		}

		// Check equipment
		for (const eq of currentKeyframe.equipment || []) {
			if (eq.x >= rect.x && eq.x <= rect.x + rect.width && eq.y >= rect.y && eq.y <= rect.y + rect.height) {
				hits.push({ type: "equipment", id: eq.id })
			}
		}

		setSelection(hits)
		startPoint.current = null
		setMarqueeRect(null)
	}, [marqueeRect, currentKeyframe, setSelection])

	const cancelMarquee = useCallback(() => {
		startPoint.current = null
		setMarqueeRect(null)
	}, [])

	return { isMarqueing, marqueeRect, onMarqueeStart, onMarqueeMove, onMarqueeEnd, cancelMarquee }
}
