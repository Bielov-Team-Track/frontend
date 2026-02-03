"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import { DrillAnimation, PlayerPosition, EquipmentItem, EQUIPMENT_DEFINITIONS } from "./types"

interface AnimationPreviewProps {
	animation: DrillAnimation
	width?: number
	height?: number
}

// Equipment rendering for preview (simplified versions)
const EquipmentPreview = ({ item }: { item: EquipmentItem }) => {
	const def = EQUIPMENT_DEFINITIONS[item.type]

	switch (item.type) {
		case "cone":
			return (
				<polygon
					points={`${item.x},${item.y - 8} ${item.x - 6},${item.y + 5} ${item.x + 6},${item.y + 5}`}
					fill={def.color}
					stroke="#c2410c"
					strokeWidth="1"
				/>
			)

		case "target":
			return (
				<g>
					<circle cx={item.x} cy={item.y} r="10" fill="white" stroke="#ef4444" strokeWidth="1.5" />
					<circle cx={item.x} cy={item.y} r="6" fill="none" stroke="#ef4444" strokeWidth="1.5" />
					<circle cx={item.x} cy={item.y} r="3" fill="#ef4444" />
				</g>
			)

		case "ball":
			return (
				<g>
					<circle cx={item.x} cy={item.y} r="6" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
					<path
						d={`M ${item.x - 4} ${item.y} Q ${item.x} ${item.y - 4} ${item.x + 4} ${item.y}`}
						fill="none"
						stroke="#f59e0b"
						strokeWidth="0.6"
					/>
				</g>
			)

		case "hoop":
			return (
				<circle cx={item.x} cy={item.y} r="12" fill="none" stroke={def.color} strokeWidth="2.5" />
			)

		case "ladder":
			return (
				<g>
					<rect
						x={item.x - 16}
						y={item.y - 5}
						width="32"
						height="10"
						fill="none"
						stroke={def.color}
						strokeWidth="1.5"
					/>
					{[-10, -3, 3, 10].map((offset) => (
						<line
							key={offset}
							x1={item.x + offset}
							y1={item.y - 5}
							x2={item.x + offset}
							y2={item.y + 5}
							stroke={def.color}
							strokeWidth="1"
						/>
					))}
				</g>
			)

		case "hurdle":
			return (
				<g>
					<rect x={item.x - 10} y={item.y - 6} width="20" height="3" fill={def.color} />
					<line x1={item.x - 8} y1={item.y - 3} x2={item.x - 8} y2={item.y + 6} stroke={def.color} strokeWidth="1.5" />
					<line x1={item.x + 8} y1={item.y - 3} x2={item.x + 8} y2={item.y + 6} stroke={def.color} strokeWidth="1.5" />
				</g>
			)

		case "antenna":
			return (
				<g>
					<line x1={item.x} y1={item.y + 8} x2={item.x} y2={item.y - 10} stroke={def.color} strokeWidth="2.5" />
					<circle cx={item.x} cy={item.y - 10} r="3" fill={def.color} />
				</g>
			)

		default:
			return null
	}
}

// Court dimensions - volleyball court is 9m wide x 18m long (1:2 ratio, portrait)
const COURT_WIDTH = 320
const COURT_HEIGHT = 640
const COURT_PADDING = 20

// Simple volleyball court component for the preview with proper 1:2 proportions
function CourtPreview({
	children,
	width = 200,
	height = 400,
}: {
	children?: React.ReactNode
	width?: number
	height?: number
}) {
	const courtLeft = COURT_PADDING
	const courtRight = COURT_WIDTH - COURT_PADDING
	const courtTop = COURT_PADDING
	const courtBottom = COURT_HEIGHT - COURT_PADDING
	const courtMidY = COURT_HEIGHT / 2
	const attackLineOffset = (courtBottom - courtTop) / 6

	return (
		<svg viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`} width={width} height={height} className="bg-green-800 rounded-lg">
			{/* Court outline */}
			<rect
				x={courtLeft}
				y={courtTop}
				width={courtRight - courtLeft}
				height={courtBottom - courtTop}
				fill="none"
				stroke="white"
				strokeWidth="2"
			/>

			{/* Center line (net) - runs horizontally */}
			<line x1={courtLeft} y1={courtMidY} x2={courtRight} y2={courtMidY} stroke="white" strokeWidth="3" />

			{/* Attack lines */}
			<line
				x1={courtLeft}
				y1={courtMidY - attackLineOffset}
				x2={courtRight}
				y2={courtMidY - attackLineOffset}
				stroke="white"
				strokeWidth="1"
				strokeDasharray="5"
			/>
			<line
				x1={courtLeft}
				y1={courtMidY + attackLineOffset}
				x2={courtRight}
				y2={courtMidY + attackLineOffset}
				stroke="white"
				strokeWidth="1"
				strokeDasharray="5"
			/>

			{/* Position markers for bottom half */}
			{[
				{ x: 60, y: courtMidY + 70, label: "4" },
				{ x: 160, y: courtMidY + 70, label: "3" },
				{ x: 260, y: courtMidY + 70, label: "2" },
				{ x: 60, y: courtMidY + 200, label: "5" },
				{ x: 160, y: courtMidY + 200, label: "6" },
				{ x: 260, y: courtMidY + 200, label: "1" },
			].map((pos) => (
				<text
					key={pos.label}
					x={pos.x}
					y={pos.y}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize="12"
					fill="rgba(255,255,255,0.25)"
					fontWeight="bold"
				>
					{pos.label}
				</text>
			))}

			{children}
		</svg>
	)
}

export function AnimationPreview({ animation, width = 200, height = 400 }: AnimationPreviewProps) {
	const [isPlaying, setIsPlaying] = useState(false)
	const [playbackProgress, setPlaybackProgress] = useState(0)
	const animationRef = useRef<number | null>(null)
	const lastTimeRef = useRef<number>(0)

	const { keyframes, speed } = animation

	// Get interpolated state for smooth animation
	const getInterpolatedState = useCallback(() => {
		if (keyframes.length < 2) {
			return keyframes[0]
		}

		const totalSegments = keyframes.length - 1
		const progressPerSegment = 1 / totalSegments
		const currentSegment = Math.floor(playbackProgress / progressPerSegment)
		const segmentProgress = (playbackProgress - currentSegment * progressPerSegment) / progressPerSegment

		const fromFrame = keyframes[Math.min(currentSegment, keyframes.length - 1)]
		const toFrame = keyframes[Math.min(currentSegment + 1, keyframes.length - 1)]

		if (!fromFrame || !toFrame) return keyframes[0]

		// Ease function for smoother animation
		const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
		const easedProgress = ease(Math.min(segmentProgress, 1))

		const interpolatedPlayers = fromFrame.players.map((player, index) => ({
			...player,
			x: player.x + (toFrame.players[index].x - player.x) * easedProgress,
			y: player.y + (toFrame.players[index].y - player.y) * easedProgress,
		}))

		const interpolatedBall = {
			x: fromFrame.ball.x + (toFrame.ball.x - fromFrame.ball.x) * easedProgress,
			y: fromFrame.ball.y + (toFrame.ball.y - fromFrame.ball.y) * easedProgress,
		}

		// Interpolate equipment positions
		const interpolatedEquipment = (fromFrame.equipment || []).map((equip, index) => {
			const toEquip = toFrame.equipment?.[index]
			if (!toEquip) return equip
			return {
				...equip,
				x: equip.x + (toEquip.x - equip.x) * easedProgress,
				y: equip.y + (toEquip.y - equip.y) * easedProgress,
			}
		})

		return {
			...fromFrame,
			players: interpolatedPlayers,
			ball: interpolatedBall,
			equipment: interpolatedEquipment,
		}
	}, [keyframes, playbackProgress])

	// Animation loop
	useEffect(() => {
		if (!isPlaying || keyframes.length < 2) {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			return
		}

		const totalDuration = speed * (keyframes.length - 1)

		const animate = (timestamp: number) => {
			if (!lastTimeRef.current) {
				lastTimeRef.current = timestamp
			}

			const elapsed = timestamp - lastTimeRef.current
			const progressIncrement = elapsed / totalDuration

			setPlaybackProgress((prev) => {
				const next = prev + progressIncrement
				if (next >= 1) {
					// Loop the animation
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
	}, [isPlaying, keyframes.length, speed])

	const displayState = isPlaying ? getInterpolatedState() : keyframes[0]

	const togglePlay = () => {
		if (!isPlaying) {
			setPlaybackProgress(0)
		}
		setIsPlaying(!isPlaying)
	}

	const reset = () => {
		setIsPlaying(false)
		setPlaybackProgress(0)
	}

	if (!displayState) return null

	return (
		<div className="space-y-3">
			<div className="flex justify-center">
				<CourtPreview width={width} height={height}>
					{/* Render equipment */}
					{(displayState.equipment || []).map((item: EquipmentItem) => (
						<EquipmentPreview key={item.id} item={item} />
					))}

					{/* Render players */}
					{displayState.players.map((player: PlayerPosition) => (
						<g key={player.id}>
							<circle cx={player.x} cy={player.y} r="14" fill={player.color} stroke="white" strokeWidth="2" />
							{player.label && (
								<text
									x={player.x}
									y={player.y}
									textAnchor="middle"
									dominantBaseline="middle"
									fontSize={player.label.length > 2 ? "8" : player.label.length > 1 ? "9" : "11"}
									fill="white"
									fontWeight="bold"
								>
									{player.label}
								</text>
							)}
						</g>
					))}

					{/* Render ball */}
					<g>
						<circle cx={displayState.ball.x} cy={displayState.ball.y} r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
						<path
							d={`M ${displayState.ball.x - 5} ${displayState.ball.y} Q ${displayState.ball.x} ${displayState.ball.y - 6} ${displayState.ball.x + 5} ${displayState.ball.y}`}
							fill="none"
							stroke="#f59e0b"
							strokeWidth="1"
						/>
						<path
							d={`M ${displayState.ball.x - 5} ${displayState.ball.y} Q ${displayState.ball.x} ${displayState.ball.y + 6} ${displayState.ball.x + 5} ${displayState.ball.y}`}
							fill="none"
							stroke="#f59e0b"
							strokeWidth="1"
						/>
					</g>
				</CourtPreview>
			</div>

			{/* Controls */}
			<div className="flex items-center justify-center gap-2">
				<Button variant="outline" size="sm" onClick={reset} disabled={!isPlaying && playbackProgress === 0}>
					<RotateCcw className="h-4 w-4" />
				</Button>
				<Button variant="outline" size="sm" onClick={togglePlay} disabled={keyframes.length < 2} className="w-20">
					{isPlaying ? (
						<>
							<Pause className="h-4 w-4 mr-1" /> Pause
						</>
					) : (
						<>
							<Play className="h-4 w-4 mr-1" /> Play
						</>
					)}
				</Button>
			</div>

			{/* Frame indicator */}
			{keyframes.length > 1 && (
				<div className="flex justify-center">
					<div className="flex gap-1">
						{keyframes.map((_, index) => {
							const isActive =
								isPlaying
									? Math.floor(playbackProgress * (keyframes.length - 1)) === index
									: index === 0
							return (
								<div
									key={index}
									className={`w-2 h-2 rounded-full transition-colors ${isActive ? "bg-blue-500" : "bg-muted-foreground/30"}`}
								/>
							)
						})}
					</div>
				</div>
			)}
		</div>
	)
}
