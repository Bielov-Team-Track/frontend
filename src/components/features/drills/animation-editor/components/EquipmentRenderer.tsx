import React from "react"
import type { EquipmentItem } from "../../types"
import { EQUIPMENT_DEFINITIONS } from "../../types"
import NoteDisplay from "./NoteDisplay"

// Label display component for equipment (shows above)
const EquipmentLabel = ({ x, y, label }: { x: number; y: number; label: string }) => (
	<g style={{ pointerEvents: "none" }}>
		<rect
			x={x - 25}
			y={y - 24}
			width="50"
			height="14"
			rx="3"
			fill="rgba(99, 102, 241, 0.9)"
		/>
		<text
			x={x}
			y={y - 14}
			textAnchor="middle"
			fontSize="8"
			fill="white"
			fontWeight="500"
		>
			{label.length > 8 ? label.slice(0, 7) + "\u2026" : label}
		</text>
	</g>
)

interface EquipmentRendererProps {
	item: EquipmentItem
	scale: number
	isDragging: boolean
	isSelected?: boolean
	isPlaying: boolean
	currentFrameIndex: number
	onMouseDown: (e: React.MouseEvent, id: string) => void
	onContextMenu: (elementType: "player" | "equipment", elementId: string, currentLabel: string, currentNote: string, clientX: number, clientY: number) => void
	onDoubleClick: (elementType: "player" | "equipment", elementId: string, currentLabel: string, clientX: number, clientY: number) => void
	onDelete: (id: string) => void
	onDeleteNote: (id: string) => void
}

const EquipmentRendererInner = ({
	item,
	isDragging,
	isSelected,
	isPlaying,
	scale,
	onMouseDown,
	onContextMenu,
	onDoubleClick,
	onDelete,
	onDeleteNote,
}: EquipmentRendererProps) => {
	const def = EQUIPMENT_DEFINITIONS[item.type]

	// Don't render if scale is 0
	if (scale === 0) return null

	// Apply scale transform centered on item position
	const transform = scale !== 1 ? `translate(${item.x}, ${item.y}) scale(${scale}) translate(${-item.x}, ${-item.y})` : undefined

	const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, item.id)

	const handleClick = (e: React.MouseEvent) => e.stopPropagation()

	const handleContextMenu = (e: React.MouseEvent) => {
		if (isPlaying) return
		e.preventDefault()
		e.stopPropagation()
		onContextMenu("equipment", item.id, item.label || "", item.note || "", e.clientX, e.clientY)
	}

	const handleDoubleClick = (e: React.MouseEvent) => {
		if (isPlaying) return
		e.preventDefault()
		e.stopPropagation()
		onDoubleClick("equipment", item.id, item.label || "", e.clientX, e.clientY)
	}

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation()
		onDelete(item.id)
	}

	const handleDeleteNote = () => onDeleteNote(item.id)

	// Invisible hit area for easier grabbing — rendered first (behind visible shape)
	const HitArea = () => (
		<>
			<circle cx={item.x} cy={item.y} r="20" fill="transparent" />
			{isSelected && !isDragging && (
				<circle cx={item.x} cy={item.y} r="20" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" style={{ pointerEvents: "none" }} />
			)}
		</>
	)

	switch (item.type) {
		case "cone":
			return (
				<g
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					onDoubleClick={handleDoubleClick}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
					<HitArea />
					{/* Cone shape */}
					<polygon
						points={`${item.x},${item.y - 10} ${item.x - 8},${item.y + 6} ${item.x + 8},${item.y + 6}`}
						fill={def.color}
						stroke={isDragging ? "yellow" : "#c2410c"}
						strokeWidth={isDragging ? "2" : "1"}
					/>
					{/* Label display */}
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{/* Note display */}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={handleDeleteNote} isPlaying={isPlaying} />}
					{/* Delete button on hover */}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleDelete}
						style={{ cursor: "pointer" }}
					>
						<circle cx={item.x + 10} cy={item.y - 10} r="6" fill="#ef4444" />
						<text x={item.x + 10} y={item.y - 7} textAnchor="middle" fontSize="8" fill="white">
							×
						</text>
					</g>
				</g>
			)

		case "target":
			return (
				<g
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					onDoubleClick={handleDoubleClick}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
					<HitArea />
					<circle cx={item.x} cy={item.y} r="12" fill="white" stroke="#ef4444" strokeWidth="2" />
					<circle cx={item.x} cy={item.y} r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
					<circle cx={item.x} cy={item.y} r="4" fill="#ef4444" />
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={handleDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleDelete}
						style={{ cursor: "pointer" }}
					>
						<circle cx={item.x + 12} cy={item.y - 12} r="6" fill="#ef4444" />
						<text x={item.x + 12} y={item.y - 9} textAnchor="middle" fontSize="8" fill="white">
							×
						</text>
					</g>
				</g>
			)

		case "ball":
			return (
				<g
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					onDoubleClick={handleDoubleClick}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
					<HitArea />
					<circle
						cx={item.x}
						cy={item.y}
						r="7"
						fill="#fef3c7"
						stroke={isDragging ? "yellow" : "#f59e0b"}
						strokeWidth={isDragging ? "2" : "1.5"}
					/>
					{/* Volleyball pattern */}
					<path
						d={`M ${item.x - 4} ${item.y} Q ${item.x} ${item.y - 5} ${item.x + 4} ${item.y}`}
						fill="none"
						stroke="#f59e0b"
						strokeWidth="0.8"
					/>
					<path
						d={`M ${item.x - 4} ${item.y} Q ${item.x} ${item.y + 5} ${item.x + 4} ${item.y}`}
						fill="none"
						stroke="#f59e0b"
						strokeWidth="0.8"
					/>
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={handleDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleDelete}
						style={{ cursor: "pointer" }}
					>
						<circle cx={item.x + 8} cy={item.y - 8} r="5" fill="#ef4444" />
						<text x={item.x + 8} y={item.y - 5} textAnchor="middle" fontSize="7" fill="white">
							×
						</text>
					</g>
				</g>
			)

		case "hoop":
			return (
				<g
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					onDoubleClick={handleDoubleClick}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
					<circle cx={item.x} cy={item.y} r="22" fill="transparent" />
					{isSelected && !isDragging && (
						<circle cx={item.x} cy={item.y} r="22" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" style={{ pointerEvents: "none" }} />
					)}
					<circle
						cx={item.x}
						cy={item.y}
						r="14"
						fill="none"
						stroke={isDragging ? "yellow" : def.color}
						strokeWidth={isDragging ? "4" : "3"}
					/>
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={handleDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleDelete}
						style={{ cursor: "pointer" }}
					>
						<circle cx={item.x + 14} cy={item.y - 14} r="6" fill="#ef4444" />
						<text x={item.x + 14} y={item.y - 11} textAnchor="middle" fontSize="8" fill="white">
							×
						</text>
					</g>
				</g>
			)

		case "ladder":
			return (
				<g
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					onDoubleClick={handleDoubleClick}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
					{/* Larger hit area for ladder */}
					<rect x={item.x - 26} y={item.y - 12} width="52" height="24" fill="transparent" />
					{isSelected && !isDragging && (
						<rect x={item.x - 26} y={item.y - 12} width="52" height="24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" rx="4" style={{ pointerEvents: "none" }} />
					)}
					{/* Ladder shape - horizontal */}
					<rect
						x={item.x - 20}
						y={item.y - 6}
						width="40"
						height="12"
						fill="none"
						stroke={isDragging ? "yellow" : def.color}
						strokeWidth="2"
					/>
					{/* Rungs */}
					{[-12, -4, 4, 12].map((offset) => (
						<line
							key={offset}
							x1={item.x + offset}
							y1={item.y - 6}
							x2={item.x + offset}
							y2={item.y + 6}
							stroke={def.color}
							strokeWidth="1.5"
						/>
					))}
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={handleDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleDelete}
						style={{ cursor: "pointer" }}
					>
						<circle cx={item.x + 20} cy={item.y - 10} r="6" fill="#ef4444" />
						<text x={item.x + 20} y={item.y - 7} textAnchor="middle" fontSize="8" fill="white">
							×
						</text>
					</g>
				</g>
			)

		case "hurdle":
			return (
				<g
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					onDoubleClick={handleDoubleClick}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
					<HitArea />
					{/* Hurdle shape */}
					<rect
						x={item.x - 12}
						y={item.y - 8}
						width="24"
						height="4"
						fill={def.color}
						stroke={isDragging ? "yellow" : "#15803d"}
						strokeWidth="1"
					/>
					<line
						x1={item.x - 10}
						y1={item.y - 4}
						x2={item.x - 10}
						y2={item.y + 8}
						stroke={def.color}
						strokeWidth="2"
					/>
					<line
						x1={item.x + 10}
						y1={item.y - 4}
						x2={item.x + 10}
						y2={item.y + 8}
						stroke={def.color}
						strokeWidth="2"
					/>
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={handleDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleDelete}
						style={{ cursor: "pointer" }}
					>
						<circle cx={item.x + 14} cy={item.y - 10} r="6" fill="#ef4444" />
						<text x={item.x + 14} y={item.y - 7} textAnchor="middle" fontSize="8" fill="white">
							×
						</text>
					</g>
				</g>
			)

		case "antenna":
			return (
				<g
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onContextMenu={handleContextMenu}
					onDoubleClick={handleDoubleClick}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
					{/* Larger hit area for antenna */}
					<rect x={item.x - 10} y={item.y - 18} width="20" height="34" fill="transparent" />
					{isSelected && !isDragging && (
						<rect x={item.x - 10} y={item.y - 18} width="20" height="34" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" rx="4" style={{ pointerEvents: "none" }} />
					)}
					{/* Antenna/marker */}
					<line
						x1={item.x}
						y1={item.y + 10}
						x2={item.x}
						y2={item.y - 12}
						stroke={isDragging ? "yellow" : def.color}
						strokeWidth="3"
					/>
					<circle
						cx={item.x}
						cy={item.y - 12}
						r="4"
						fill={def.color}
						stroke={isDragging ? "yellow" : "#7c3aed"}
						strokeWidth="1"
					/>
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={handleDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={handleDelete}
						style={{ cursor: "pointer" }}
					>
						<circle cx={item.x + 8} cy={item.y - 16} r="6" fill="#ef4444" />
						<text x={item.x + 8} y={item.y - 13} textAnchor="middle" fontSize="8" fill="white">
							×
						</text>
					</g>
				</g>
			)

		default:
			return null
	}
}

const EquipmentRenderer = React.memo(EquipmentRendererInner, (prev, next) => {
	return (
		prev.item.x === next.item.x &&
		prev.item.y === next.item.y &&
		prev.item.label === next.item.label &&
		prev.item.note === next.item.note &&
		prev.item.type === next.item.type &&
		prev.scale === next.scale &&
		prev.isDragging === next.isDragging &&
		prev.isSelected === next.isSelected &&
		prev.isPlaying === next.isPlaying &&
		prev.currentFrameIndex === next.currentFrameIndex
	)
})

EquipmentRenderer.displayName = "EquipmentRenderer"

export default EquipmentRenderer
export type { EquipmentRendererProps }
