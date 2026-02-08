import React, { useState } from "react"

interface BallRendererProps {
	ball: { x: number; y: number }
	isDragging: boolean
	isPlaying: boolean
	onMouseDown: (e: React.MouseEvent) => void
}

const BallRendererInner = ({
	ball,
	isDragging,
	isPlaying,
	onMouseDown,
}: BallRendererProps) => {
	const [hovered, setHovered] = useState(false)

	return (
		<g
			onMouseDown={!isPlaying ? onMouseDown : undefined}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{ cursor: isPlaying ? "default" : "grab" }}
		>
			<circle
				cx={ball.x}
				cy={ball.y}
				r="8"
				fill="#fef3c7"
				stroke={isDragging ? "yellow" : "#f59e0b"}
				strokeWidth={isDragging ? "3" : "2"}
			/>
			{/* Volleyball pattern */}
			<path
				d={`M ${ball.x - 5} ${ball.y} Q ${ball.x} ${ball.y - 6} ${ball.x + 5} ${ball.y}`}
				fill="none"
				stroke="#f59e0b"
				strokeWidth="1"
				style={{ pointerEvents: "none" }}
			/>
			<path
				d={`M ${ball.x - 5} ${ball.y} Q ${ball.x} ${ball.y + 6} ${ball.x + 5} ${ball.y}`}
				fill="none"
				stroke="#f59e0b"
				strokeWidth="1"
				style={{ pointerEvents: "none" }}
			/>
			{/* Tooltip */}
			{hovered && !isDragging && !isPlaying && (
				<g style={{ pointerEvents: "none" }}>
					<rect
						x={ball.x - 35}
						y={ball.y - 30}
						width="70"
						height="18"
						rx="4"
						fill="rgba(0,0,0,0.85)"
					/>
					<text
						x={ball.x}
						y={ball.y - 18}
						textAnchor="middle"
						fontSize="10"
						fill="white"
					>
						Volleyball
					</text>
				</g>
			)}
		</g>
	)
}

const BallRenderer = React.memo(BallRendererInner, (prev, next) => {
	return (
		prev.ball.x === next.ball.x &&
		prev.ball.y === next.ball.y &&
		prev.isDragging === next.isDragging &&
		prev.isPlaying === next.isPlaying
	)
})

BallRenderer.displayName = "BallRenderer"

export default BallRenderer
