import { useState, useCallback, useRef, useEffect } from "react"

export function useAnimationPlayback(frameCount: number, initialSpeed: number = 1000) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [playbackProgress, setPlaybackProgress] = useState(0)
	const [animationSpeed, setAnimationSpeed] = useState(initialSpeed)
	const animationRef = useRef<number | null>(null)
	const lastTimeRef = useRef<number>(0)

	// Animation loop
	useEffect(() => {
		if (!isPlaying || frameCount < 2) {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			return
		}

		const totalDuration = animationSpeed * (frameCount - 1)

		const animate = (timestamp: number) => {
			if (!lastTimeRef.current) {
				lastTimeRef.current = timestamp
			}

			const elapsed = timestamp - lastTimeRef.current
			const progressIncrement = elapsed / totalDuration

			setPlaybackProgress((prev) => {
				const next = prev + progressIncrement
				if (next >= 1) {
					setIsPlaying(false)
					return 0
				}
				return next
			})

			lastTimeRef.current = timestamp
			animationRef.current = requestAnimationFrame(animate)
		}

		lastTimeRef.current = 0
		animationRef.current = requestAnimationFrame(animate)

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [isPlaying, frameCount, animationSpeed])

	const togglePlay = useCallback(() => {
		if (frameCount < 2) return
		setIsPlaying((prev) => {
			if (!prev) setPlaybackProgress(0)
			return !prev
		})
	}, [frameCount])

	return {
		isPlaying,
		playbackProgress,
		animationSpeed,
		setAnimationSpeed,
		togglePlay,
		setPlaybackProgress,
		setIsPlaying,
	}
}
