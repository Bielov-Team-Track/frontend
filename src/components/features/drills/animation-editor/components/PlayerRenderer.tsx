import React, { useState } from "react"
import type { PlayerPosition } from "../../types"
import NoteDisplay from "./NoteDisplay"

interface PlayerRendererProps {
	player: PlayerPosition
	scale: number
	isDragging: boolean
	isSelected?: boolean
	canDelete: boolean
	isPlaying: boolean
	currentFrameIndex: number
	onMouseDown: (e: React.MouseEvent, id: string) => void
	onContextMenu: (elementType: "player" | "equipment", elementId: string, currentLabel: string, currentNote: string, clientX: number, clientY: number) => void
	onDoubleClick: (elementType: "player" | "equipment", elementId: string, currentLabel: string, clientX: number, clientY: number) => void
	onDelete: (id: string) => void
	onDeleteNote: (id: string) => void
}

const PlayerRendererInner = ({
	player,
	scale,
	isDragging,
	isSelected,
	canDelete,
	isPlaying,
	onMouseDown,
	onContextMenu,
	onDoubleClick,
	onDelete,
	onDeleteNote,
}: PlayerRendererProps) => {
	const [hovered, setHovered] = useState(false)

	// Don't render if scale is 0
	if (scale === 0) return null

	// Apply scale transform centered on player position
	const transform = scale !== 1 ? `translate(${player.x}, ${player.y}) scale(${scale}) translate(${-player.x}, ${-player.y})` : undefined

	const showTooltip = hovered && !isDragging && !isPlaying

	return (
		<g
			onMouseDown={!isPlaying ? (e) => onMouseDown(e, player.id) : undefined}
			onClick={(e) => e.stopPropagation()}
			onDoubleClick={(e) => {
				if (isPlaying) return
				e.preventDefault()
				e.stopPropagation()
				onDoubleClick("player", player.id, player.label || "", e.clientX, e.clientY)
			}}
			onContextMenu={(e) => {
				if (isPlaying) return
				e.preventDefault()
				e.stopPropagation()
				onContextMenu("player", player.id, player.label || "", player.note || "", e.clientX, e.clientY)
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{ cursor: isPlaying ? "default" : "grab" }}
			className="group"
			transform={transform}
		>
			{/* Selection ring */}
			{isSelected && !isDragging && (
				<circle
					cx={player.x}
					cy={player.y}
					r="18"
					fill="none"
					stroke="#3b82f6"
					strokeWidth="2"
					strokeDasharray="4 2"
					style={{ pointerEvents: "none" }}
				/>
			)}
			<circle
				cx={player.x}
				cy={player.y}
				r="14"
				fill={player.color}
				stroke={isDragging ? "yellow" : "white"}
				strokeWidth={isDragging ? "3" : "2"}
			/>
			{player.label && (
				<text
					x={player.x}
					y={player.y}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize={player.label.length > 2 ? "8" : player.label.length > 1 ? "9" : "11"}
					fill="white"
					fontWeight="bold"
					style={{ pointerEvents: "none" }}
				>
					{player.label.slice(0, 3)}
				</text>
			)}
			{/* Note display - always visible when present */}
			{player.note && (
				<NoteDisplay
					x={player.x}
					y={player.y}
					note={player.note}
					color="rgba(59, 130, 246, 0.95)"
					onDelete={() => onDeleteNote(player.id)}
					isPlaying={isPlaying}
				/>
			)}
			{/* Delete button on hover */}
			{hovered && !isPlaying && canDelete && (
				<g
					className="opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => {
						e.stopPropagation()
						onDelete(player.id)
					}}
					style={{ cursor: "pointer" }}
				>
					<circle cx={player.x + 12} cy={player.y - 12} r="6" fill="#ef4444" />
					<text x={player.x + 12} y={player.y - 9} textAnchor="middle" fontSize="8" fill="white">
						×
					</text>
				</g>
			)}
			{/* Tooltip on hover - shows full label */}
			{showTooltip && (
				<g style={{ pointerEvents: "none" }}>
					<rect
						x={player.x - 60}
						y={player.y - 48}
						width="120"
						height="30"
						rx="4"
						fill="rgba(0,0,0,0.85)"
					/>
					<text
						x={player.x}
						y={player.y - 35}
						textAnchor="middle"
						fontSize="9"
						fill="white"
					>
						{player.label || "Player"}
					</text>
					<text
						x={player.x}
						y={player.y - 23}
						textAnchor="middle"
						fontSize="8"
						fill="#9ca3af"
					>
						Double-click to edit label
					</text>
				</g>
			)}
		</g>
	)
}

const PlayerRenderer = React.memo(PlayerRendererInner, (prev, next) => {
	return (
		prev.player.x === next.player.x &&
		prev.player.y === next.player.y &&
		prev.player.color === next.player.color &&
		prev.player.label === next.player.label &&
		prev.player.note === next.player.note &&
		prev.scale === next.scale &&
		prev.isDragging === next.isDragging &&
		prev.isSelected === next.isSelected &&
		prev.canDelete === next.canDelete &&
		prev.isPlaying === next.isPlaying &&
		prev.currentFrameIndex === next.currentFrameIndex
	)
})

PlayerRenderer.displayName = "PlayerRenderer"

export default PlayerRenderer
