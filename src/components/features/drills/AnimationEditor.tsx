"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
	Play,
	Pause,
	SkipBack,
	Plus,
	Trash2,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	ChevronUp,
	Save,
	GripVertical,
	X,
	Info,
	Users,
	MessageSquare,
	Tag,
} from "lucide-react"
import {
	DrillAnimation,
	AnimationKeyframe,
	PlayerPosition,
	EquipmentItem,
	EquipmentType,
	EQUIPMENT_DEFINITIONS,
	CourtViewMode,
} from "./types"

const PLAYER_COLORS = [
	"#3b82f6", // blue
	"#ef4444", // red
	"#22c55e", // green
	"#a855f7", // purple
	"#f97316", // orange
	"#06b6d4", // cyan
	"#ec4899", // pink
	"#eab308", // yellow
]

const PLAYER_LABEL_PRESETS: { label: string; description: string }[] = [
	{ label: "1", description: "Position 1" },
	{ label: "2", description: "Position 2" },
	{ label: "3", description: "Position 3" },
	{ label: "4", description: "Position 4" },
	{ label: "5", description: "Position 5" },
	{ label: "6", description: "Position 6" },
	{ label: "S", description: "Setter" },
	{ label: "OH", description: "Outside Hitter" },
	{ label: "MB", description: "Middle Blocker" },
	{ label: "OP", description: "Opposite" },
	{ label: "L", description: "Libero" },
	{ label: "C", description: "Coach" },
]

interface AnimationEditorProps {
	initialAnimation?: DrillAnimation
	onSave?: (animation: DrillAnimation) => void
	onCancel?: () => void
	isSaving?: boolean
}

// Helper to split text into lines
const splitTextIntoLines = (text: string, maxCharsPerLine: number): string[] => {
	const words = text.split(' ')
	const lines: string[] = []
	let currentLine = ''

	for (const word of words) {
		if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
			currentLine = currentLine ? `${currentLine} ${word}` : word
		} else {
			if (currentLine) lines.push(currentLine)
			currentLine = word.length > maxCharsPerLine ? word.slice(0, maxCharsPerLine - 1) + '…' : word
		}
	}
	if (currentLine) lines.push(currentLine)
	return lines.slice(0, 4) // Max 4 lines
}

// Note display component - full text, multi-line, with delete button
const NoteDisplay = ({
	x,
	y,
	note,
	color,
	onDelete,
	isPlaying,
}: {
	x: number
	y: number
	note: string
	color: string
	onDelete: () => void
	isPlaying: boolean
}) => {
	const maxCharsPerLine = 14
	const lines = splitTextIntoLines(note, maxCharsPerLine)
	const lineHeight = 12
	const padding = 6
	const boxWidth = 90
	const boxHeight = lines.length * lineHeight + padding * 2

	// Calculate position to stay within court bounds
	// Court: x from 20 to 300, y from 20 to 620
	let noteX = x - boxWidth / 2
	let noteY = y + 20

	// Clamp to court boundaries
	if (noteX < 22) noteX = 22
	if (noteX + boxWidth > 298) noteX = 298 - boxWidth
	if (noteY + boxHeight > 618) noteY = y - boxHeight - 20 // Show above if no room below

	const centerX = noteX + boxWidth / 2

	return (
		<g>
			{/* Background */}
			<rect
				x={noteX}
				y={noteY}
				width={boxWidth}
				height={boxHeight}
				rx="4"
				fill={color}
				style={{ pointerEvents: "none" }}
			/>
			{/* Delete button */}
			{!isPlaying && (
				<g
					onClick={(e) => {
						e.stopPropagation()
						onDelete()
					}}
					style={{ cursor: "pointer" }}
				>
					<circle
						cx={noteX + boxWidth - 2}
						cy={noteY + 2}
						r="7"
						fill="#ef4444"
					/>
					<text
						x={noteX + boxWidth - 2}
						y={noteY + 6}
						textAnchor="middle"
						fontSize="10"
						fill="white"
						fontWeight="bold"
						style={{ pointerEvents: "none" }}
					>
						×
					</text>
				</g>
			)}
			{/* Text lines */}
			{lines.map((line, i) => (
				<text
					key={i}
					x={centerX}
					y={noteY + padding + 9 + i * lineHeight}
					textAnchor="middle"
					fontSize="9"
					fill="white"
					fontWeight="500"
					style={{ pointerEvents: "none" }}
				>
					{line}
				</text>
			))}
		</g>
	)
}

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
			{label.length > 8 ? label.slice(0, 7) + "…" : label}
		</text>
	</g>
)

// Legacy note component - keeping for compatibility but using NoteDisplay now
const EquipmentNote = ({ x, y, note, hasLabel }: { x: number; y: number; note: string; hasLabel?: boolean }) => (
	<g style={{ pointerEvents: "none" }}>
		<rect
			x={x - 40}
			y={y + 16}
			width="80"
			height="16"
			rx="3"
			fill="rgba(34, 197, 94, 0.9)"
		/>
		<text
			x={x}
			y={y + 27}
			textAnchor="middle"
			fontSize="9"
			fill="white"
			fontWeight="500"
		>
			{note.length > 12 ? note.slice(0, 11) + "…" : note}
		</text>
	</g>
)

// Equipment SVG components
const EquipmentSVG = ({
	item,
	isDragging,
	onMouseDown,
	onDelete,
	onDeleteNote,
	onContextMenu,
	scale = 1,
	isPlaying = false,
}: {
	item: EquipmentItem
	isDragging: boolean
	onMouseDown: (e: React.MouseEvent) => void
	onDelete: () => void
	onDeleteNote: () => void
	onContextMenu?: (e: React.MouseEvent) => void
	scale?: number
	isPlaying?: boolean
}) => {
	const def = EQUIPMENT_DEFINITIONS[item.type]

	// Don't render if scale is 0
	if (scale === 0) return null

	// Apply scale transform centered on item position
	const transform = scale !== 1 ? `translate(${item.x}, ${item.y}) scale(${scale}) translate(${-item.x}, ${-item.y})` : undefined

	switch (item.type) {
		case "cone":
			return (
				<g
					onMouseDown={onMouseDown}
					onContextMenu={onContextMenu}
					style={{ cursor: "grab" }}
					className="group"
					transform={transform}
				>
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
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={onDeleteNote} isPlaying={isPlaying} />}
					{/* Delete button on hover */}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
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
				<g onMouseDown={onMouseDown} onContextMenu={onContextMenu} style={{ cursor: "grab" }} className="group" transform={transform}>
					<circle cx={item.x} cy={item.y} r="12" fill="white" stroke="#ef4444" strokeWidth="2" />
					<circle cx={item.x} cy={item.y} r="8" fill="none" stroke="#ef4444" strokeWidth="2" />
					<circle cx={item.x} cy={item.y} r="4" fill="#ef4444" />
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={onDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
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
				<g onMouseDown={onMouseDown} onContextMenu={onContextMenu} style={{ cursor: "grab" }} className="group" transform={transform}>
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
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={onDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
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
				<g onMouseDown={onMouseDown} onContextMenu={onContextMenu} style={{ cursor: "grab" }} className="group" transform={transform}>
					<circle
						cx={item.x}
						cy={item.y}
						r="14"
						fill="none"
						stroke={isDragging ? "yellow" : def.color}
						strokeWidth={isDragging ? "4" : "3"}
					/>
					{item.label && <EquipmentLabel x={item.x} y={item.y} label={item.label} />}
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={onDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
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
				<g onMouseDown={onMouseDown} onContextMenu={onContextMenu} style={{ cursor: "grab" }} className="group" transform={transform}>
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
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={onDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
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
				<g onMouseDown={onMouseDown} onContextMenu={onContextMenu} style={{ cursor: "grab" }} className="group" transform={transform}>
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
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={onDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
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
				<g onMouseDown={onMouseDown} onContextMenu={onContextMenu} style={{ cursor: "grab" }} className="group" transform={transform}>
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
					{item.note && <NoteDisplay x={item.x} y={item.y} note={item.note} color="rgba(34, 197, 94, 0.95)" onDelete={onDeleteNote} isPlaying={isPlaying} />}
					<g
						className="opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
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

// Court dimensions - volleyball court is 9m wide x 18m long (1:2 ratio)
// Viewed from above with net running horizontally
const COURT_WIDTH = 320
const COURT_HEIGHT = 640
const COURT_PADDING = 20

// Simple volleyball court SVG component with proper 1:2 proportions (portrait)
const VolleyballCourt = ({
	children,
	width = 400,
	height = 800,
	svgRef,
	onMouseMove,
	onMouseUp,
	onMouseLeave,
	onDrop,
	onDragOver,
	viewMode = "full",
}: {
	children?: React.ReactNode
	width?: number
	height?: number
	svgRef?: React.RefObject<SVGSVGElement | null>
	onMouseMove?: (e: React.MouseEvent<SVGSVGElement>) => void
	onMouseUp?: () => void
	onMouseLeave?: () => void
	onDrop?: (e: React.DragEvent<SVGSVGElement>) => void
	onDragOver?: (e: React.DragEvent<SVGSVGElement>) => void
	viewMode?: CourtViewMode
}) => {
	// Court boundaries
	const courtLeft = COURT_PADDING
	const courtRight = COURT_WIDTH - COURT_PADDING
	const courtTop = COURT_PADDING
	const courtBottom = COURT_HEIGHT - COURT_PADDING
	const courtMidY = COURT_HEIGHT / 2
	// Attack line is 3m from net (1/6 of total court length)
	const attackLineOffset = (courtBottom - courtTop) / 6

	// Determine viewBox based on mode
	const getViewBox = () => {
		switch (viewMode) {
			case "half":
				return `0 ${COURT_HEIGHT / 2} ${COURT_WIDTH} ${COURT_HEIGHT / 2}`
			case "empty":
			case "full":
			default:
				return `0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`
		}
	}

	// Determine background color
	const bgClass = viewMode === "empty" ? "bg-slate-700" : "bg-green-800"

	return (
		<svg
			ref={svgRef}
			viewBox={getViewBox()}
			width={width}
			height={viewMode === "half" ? height / 2 : height}
			className={`${bgClass} cursor-crosshair`}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseLeave}
			onDrop={onDrop}
			onDragOver={onDragOver}
		>
			{/* Only render court lines if not in empty mode */}
			{viewMode !== "empty" && (
				<>
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
					{/* Attack lines (3m from net) */}
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
					{/* Position markers for bottom half (home team) - standard volleyball rotation */}
					{viewMode === "full" && [
						// Front row (near net)
						{ x: 60, y: courtMidY + 70, label: "4" },
						{ x: 160, y: courtMidY + 70, label: "3" },
						{ x: 260, y: courtMidY + 70, label: "2" },
						// Back row
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
							fontSize="14"
							fill="rgba(255,255,255,0.25)"
							fontWeight="bold"
						>
							{pos.label}
						</text>
					))}
				</>
			)}
			{children}
		</svg>
	)
}

const createInitialKeyframe = (playerCount: number = 6): AnimationKeyframe => ({
	id: crypto.randomUUID(),
	players: Array.from({ length: playerCount }, (_, i) => ({
		id: `p${i + 1}`,
		// Position players in volleyball formation on bottom half (home team side)
		// Front row: positions 4, 3, 2 (left to right near net)
		// Back row: positions 5, 6, 1 (left to right)
		x: 60 + (i % 3) * 100,
		y: COURT_HEIGHT / 2 + 70 + Math.floor(i / 3) * 130,
		color: PLAYER_COLORS[i % PLAYER_COLORS.length],
		label: String(i + 1),
	})),
	ball: { x: COURT_WIDTH / 2, y: COURT_HEIGHT / 2 + 120 },
	equipment: [],
})

// Equipment Toolbox Sidebar
const EquipmentToolbox = ({
	onDragStart,
	onPlayerDragStart,
	onClick,
	onPlayerClick,
	isPlaying,
}: {
	onDragStart: (type: EquipmentType) => void
	onPlayerDragStart: () => void
	onClick: (type: EquipmentType) => void
	onPlayerClick: () => void
	isPlaying: boolean
}) => {
	const equipmentTypes = Object.entries(EQUIPMENT_DEFINITIONS) as [EquipmentType, { name: string; icon: string; color: string }][]

	return (
		<div className="w-48 bg-card border border-border rounded-lg p-3 space-y-3 h-fit">
			<div className="flex items-center gap-2 text-sm font-medium text-foreground border-b border-border pb-2">
				<GripVertical className="h-4 w-4 text-muted-foreground" />
				Toolbox
			</div>
			<div className="space-y-2">
				{/* Player item */}
				<div
					draggable={!isPlaying}
					onDragStart={onPlayerDragStart}
					onClick={() => !isPlaying && onPlayerClick()}
					className={`flex items-center gap-2 p-2 rounded-md border border-border transition-all ${
						isPlaying
							? "opacity-50 cursor-not-allowed"
							: "hover:bg-hover cursor-pointer"
					}`}
				>
					<span
						className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
						style={{ backgroundColor: PLAYER_COLORS[0] }}
					>
						P
					</span>
					<span className="text-sm text-foreground">Player</span>
				</div>
				{/* Equipment items */}
				{equipmentTypes.map(([type, def]) => (
					<div
						key={type}
						draggable={!isPlaying}
						onDragStart={() => onDragStart(type)}
						onClick={() => !isPlaying && onClick(type)}
						className={`flex items-center gap-2 p-2 rounded-md border border-border transition-all ${
							isPlaying
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-hover cursor-pointer"
						}`}
					>
						<span
							className="w-6 h-6 rounded flex items-center justify-center text-sm"
							style={{ backgroundColor: def.color + "30" }}
						>
							{def.icon}
						</span>
						<span className="text-sm text-foreground">{def.name}</span>
					</div>
				))}
			</div>
			<div className="text-xs text-muted-foreground pt-2 border-t border-border">
				Click or drag items onto court
			</div>
		</div>
	)
}

// Elements Panel - shows list of placed elements for quick deletion
const ElementsPanel = ({
	players,
	equipment,
	onDeletePlayer,
	onDeleteEquipment,
	isPlaying,
}: {
	players: PlayerPosition[]
	equipment: EquipmentItem[]
	onDeletePlayer: (id: string) => void
	onDeleteEquipment: (id: string) => void
	isPlaying: boolean
}) => {
	return (
		<div className="w-48 bg-card border border-border rounded-lg p-3 h-fit max-h-[600px] flex flex-col">
			<div className="flex items-center gap-2 text-sm font-medium text-foreground border-b border-border pb-2 mb-3 shrink-0">
				<Users className="h-4 w-4 text-muted-foreground" />
				Elements
			</div>

			<div className="overflow-y-auto space-y-3 min-h-0">
				{/* Players list */}
				<div className="space-y-1">
					<div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
						Players ({players.length})
					</div>
					{players.map((player) => (
						<div
							key={player.id}
							className="flex items-center justify-between p-2 rounded-md border border-transparent hover:bg-hover transition-colors group"
						>
							<div className="flex items-center gap-2">
								<span
									className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
									style={{ backgroundColor: player.color }}
								>
									{player.label?.slice(0, 1) || "?"}
								</span>
								<span className="text-sm truncate">{player.label || "Player"}</span>
							</div>
							<button
								onClick={() => onDeletePlayer(player.id)}
								disabled={isPlaying || players.length <= 1}
								className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted-foreground/20 text-muted-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
								title={players.length <= 1 ? "Cannot delete last player" : "Delete player"}
							>
								<X className="h-3 w-3" />
							</button>
						</div>
					))}
				</div>

				{/* Equipment list */}
				{equipment.length > 0 && (
					<div className="space-y-1 pt-2 border-t border-border">
						<div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
							Equipment ({equipment.length})
						</div>
						{equipment.map((item) => {
							const def = EQUIPMENT_DEFINITIONS[item.type]
							return (
								<div
									key={item.id}
									className="flex items-center justify-between p-2 rounded-md border border-transparent hover:bg-hover transition-colors group"
								>
									<div className="flex items-center gap-2">
										<span
											className="w-5 h-5 rounded flex items-center justify-center text-xs shrink-0"
											style={{ backgroundColor: def.color + "30" }}
										>
											{def.icon}
										</span>
										<span className="text-sm truncate">{def.name}</span>
									</div>
									<button
										onClick={() => onDeleteEquipment(item.id)}
										disabled={isPlaying}
										className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted-foreground/20 text-muted-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
										title="Delete equipment"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}

// Element Context Menu - shows on right-click
// Styled to match DropdownMenuContent for visual consistency
const ElementContextMenu = ({
	position,
	onChangeLabel,
	onAddNote,
	onClose,
}: {
	position: { x: number; y: number }
	onChangeLabel: () => void
	onAddNote: () => void
	onClose: () => void
}) => {
	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = () => onClose()
		document.addEventListener("click", handleClickOutside)
		return () => document.removeEventListener("click", handleClickOutside)
	}, [onClose])

	return (
		<div
			className="absolute z-50 bg-popover text-popover-foreground ring-foreground/10 min-w-32 rounded-lg p-1 shadow-md ring-1 animate-in fade-in-0 zoom-in-95"
			style={{ left: position.x, top: position.y }}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				className="w-full gap-1.5 rounded-md px-1.5 py-1 text-sm flex items-center hover:bg-hover outline-none cursor-default"
				onClick={() => onChangeLabel()}
			>
				<Tag className="h-4 w-4" />
				Change Label
			</button>
			<button
				className="w-full gap-1.5 rounded-md px-1.5 py-1 text-sm flex items-center hover:bg-hover outline-none cursor-default"
				onClick={() => onAddNote()}
			>
				<MessageSquare className="h-4 w-4" />
				Add Note
			</button>
		</div>
	)
}

// Label Editor Popup
const LabelEditor = ({
	currentLabel,
	onUpdate,
	onClose,
	position,
}: {
	currentLabel: string
	onUpdate: (label: string) => void
	onClose: () => void
	position: { x: number; y: number }
}) => {
	const [label, setLabel] = useState(currentLabel)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		inputRef.current?.focus()
		inputRef.current?.select()
	}, [])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onUpdate(label)
		onClose()
	}

	return (
		<div
			className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[220px]"
			style={{ left: position.x, top: position.y }}
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-medium">Change Label</span>
				<button onClick={onClose} className="text-muted-foreground hover:text-foreground">
					<X className="h-4 w-4" />
				</button>
			</div>
			<form onSubmit={handleSubmit} className="space-y-2">
				<Input
					ref={inputRef}
					value={label}
					onChange={(e) => setLabel(e.target.value.slice(0, 20))}
					placeholder="Label (max 20 chars)"
					maxLength={20}
					className="h-8"
				/>
				<p className="text-xs text-muted-foreground">
					Shows first 3 chars on court, full label in tooltip
				</p>
				<div className="flex flex-wrap gap-1">
					{PLAYER_LABEL_PRESETS.map((preset) => (
						<button
							key={preset.label}
							type="button"
							onClick={() => {
								setLabel(preset.label)
							}}
							className="px-2 py-1 text-xs rounded bg-secondary hover:bg-secondary/80 transition-colors"
							title={preset.description}
						>
							{preset.label}
						</button>
					))}
				</div>
				<Button type="submit" size="sm" className="w-full">
					Apply
				</Button>
			</form>
		</div>
	)
}

// Note Editor Popup
const NoteEditor = ({
	currentNote,
	onUpdate,
	onClose,
	position,
}: {
	currentNote: string
	onUpdate: (note: string) => void
	onClose: () => void
	position: { x: number; y: number }
}) => {
	const [note, setNote] = useState(currentNote)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		textareaRef.current?.focus()
	}, [])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onUpdate(note)
		onClose()
	}

	return (
		<div
			className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[250px]"
			style={{ left: position.x, top: position.y }}
		>
			<div className="flex items-center justify-between mb-2">
				<span className="text-sm font-medium flex items-center gap-2">
					<MessageSquare className="h-4 w-4" />
					Add Note
				</span>
				<button onClick={onClose} className="text-muted-foreground hover:text-foreground">
					<X className="h-4 w-4" />
				</button>
			</div>
			<form onSubmit={handleSubmit} className="space-y-2">
				<textarea
					ref={textareaRef}
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder="e.g., Attacks, Sets to 4, Defense..."
					className="w-full h-20 px-2 py-1.5 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<p className="text-xs text-muted-foreground">
					Note will persist on this and future frames until changed
				</p>
				<div className="flex gap-2">
					{note && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => {
								onUpdate("")
								onClose()
							}}
						>
							Clear
						</Button>
					)}
					<Button type="submit" size="sm" className="flex-1">
						{note ? "Save" : "Close"}
					</Button>
				</div>
			</form>
		</div>
	)
}

export function AnimationEditor({ initialAnimation, onSave, onCancel, isSaving = false }: AnimationEditorProps) {
	const [keyframes, setKeyframes] = useState<AnimationKeyframe[]>(
		initialAnimation?.keyframes || [createInitialKeyframe()]
	)
	const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
	const [isPlaying, setIsPlaying] = useState(false)
	const [playbackProgress, setPlaybackProgress] = useState(0)
	const [animationSpeed, setAnimationSpeed] = useState(initialAnimation?.speed || 1000)
	const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null)
	const [draggingBall, setDraggingBall] = useState(false)
	const [draggingEquipment, setDraggingEquipment] = useState<string | null>(null)
	const [draggedEquipmentType, setDraggedEquipmentType] = useState<EquipmentType | null>(null)
	const [draggingPlayerFromToolbox, setDraggingPlayerFromToolbox] = useState(false)
	const [contextMenu, setContextMenu] = useState<{
		elementType: "player" | "equipment"
		elementId: string
		currentLabel: string
		currentNote: string
		position: { x: number; y: number }
	} | null>(null)
	const [editingLabel, setEditingLabel] = useState<{
		elementType: "player" | "equipment"
		elementId: string
		currentLabel: string
		position: { x: number; y: number }
	} | null>(null)
	const [editingNote, setEditingNote] = useState<{
		elementType: "player" | "equipment"
		elementId: string
		currentNote: string
		position: { x: number; y: number }
	} | null>(null)
	const [hoveredBall, setHoveredBall] = useState(false)
	const [courtViewMode, setCourtViewMode] = useState<CourtViewMode>("full")
	const [infoCollapsed, setInfoCollapsed] = useState(false)
	const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null)
	const svgRef = useRef<SVGSVGElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const animationRef = useRef<number | null>(null)
	const lastTimeRef = useRef<number>(0)

	const currentKeyframe = keyframes[currentFrameIndex]

	// Helper to calculate element scale during transitions (zoom in/out effect)
	const getElementScale = useCallback((
		elementId: string,
		fromFrame: AnimationKeyframe,
		toFrame: AnimationKeyframe,
		progress: number,
		type: "player" | "equipment"
	): number => {
		const fromElements = type === "player" ? fromFrame.players : (fromFrame.equipment || [])
		const toElements = type === "player" ? toFrame.players : (toFrame.equipment || [])

		const inFrom = fromElements.some((e) => e.id === elementId)
		const inTo = toElements.some((e) => e.id === elementId)

		// Make zoom animations 3x faster (complete in first third of transition)
		const fastProgress = Math.min(1, progress * 3)
		const fastReverseProgress = Math.max(0, 1 - (1 - progress) * 3)

		if (inFrom && inTo) return 1           // Visible throughout
		if (!inFrom && inTo) return fastProgress    // Appearing: zoom in fast
		if (inFrom && !inTo) return fastReverseProgress // Disappearing: zoom out fast at end
		return 0
	}, [])

	// Interpolate between keyframes for smooth animation
	const getInterpolatedState = useCallback((): AnimationKeyframe & { playerScales?: Record<string, number>; equipmentScales?: Record<string, number> } => {
		if (keyframes.length < 2 || !isPlaying) {
			return currentKeyframe
		}

		const totalSegments = keyframes.length - 1
		const progressPerSegment = 1 / totalSegments
		const currentSegment = Math.floor(playbackProgress / progressPerSegment)
		const segmentProgress =
			(playbackProgress - currentSegment * progressPerSegment) / progressPerSegment

		const fromFrame = keyframes[Math.min(currentSegment, keyframes.length - 1)]
		const toFrame = keyframes[Math.min(currentSegment + 1, keyframes.length - 1)]

		if (!fromFrame || !toFrame) return currentKeyframe

		const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
		const easedProgress = ease(segmentProgress)

		// Collect all unique player IDs from both frames
		const allPlayerIds = new Set([
			...fromFrame.players.map((p) => p.id),
			...toFrame.players.map((p) => p.id),
		])

		// Calculate scales for each player
		const playerScales: Record<string, number> = {}
		allPlayerIds.forEach((id) => {
			playerScales[id] = getElementScale(id, fromFrame, toFrame, easedProgress, "player")
		})

		// Interpolate players that exist in both frames, include appearing/disappearing ones
		const interpolatedPlayers: PlayerPosition[] = []
		allPlayerIds.forEach((id) => {
			const fromPlayer = fromFrame.players.find((p) => p.id === id)
			const toPlayer = toFrame.players.find((p) => p.id === id)

			if (fromPlayer && toPlayer) {
				// Exists in both - interpolate position
				interpolatedPlayers.push({
					...fromPlayer,
					x: fromPlayer.x + (toPlayer.x - fromPlayer.x) * easedProgress,
					y: fromPlayer.y + (toPlayer.y - fromPlayer.y) * easedProgress,
				})
			} else if (fromPlayer) {
				// Disappearing - keep at last position
				interpolatedPlayers.push(fromPlayer)
			} else if (toPlayer) {
				// Appearing - show at target position
				interpolatedPlayers.push(toPlayer)
			}
		})

		const interpolatedBall = {
			x: fromFrame.ball.x + (toFrame.ball.x - fromFrame.ball.x) * easedProgress,
			y: fromFrame.ball.y + (toFrame.ball.y - fromFrame.ball.y) * easedProgress,
		}

		// Collect all unique equipment IDs from both frames
		const allEquipmentIds = new Set([
			...(fromFrame.equipment || []).map((e) => e.id),
			...(toFrame.equipment || []).map((e) => e.id),
		])

		// Calculate scales for each equipment
		const equipmentScales: Record<string, number> = {}
		allEquipmentIds.forEach((id) => {
			equipmentScales[id] = getElementScale(id, fromFrame, toFrame, easedProgress, "equipment")
		})

		// Interpolate equipment
		const interpolatedEquipment: EquipmentItem[] = []
		allEquipmentIds.forEach((id) => {
			const fromEquip = (fromFrame.equipment || []).find((e) => e.id === id)
			const toEquip = (toFrame.equipment || []).find((e) => e.id === id)

			if (fromEquip && toEquip) {
				interpolatedEquipment.push({
					...fromEquip,
					x: fromEquip.x + (toEquip.x - fromEquip.x) * easedProgress,
					y: fromEquip.y + (toEquip.y - fromEquip.y) * easedProgress,
				})
			} else if (fromEquip) {
				interpolatedEquipment.push(fromEquip)
			} else if (toEquip) {
				interpolatedEquipment.push(toEquip)
			}
		})

		return {
			...fromFrame,
			players: interpolatedPlayers,
			ball: interpolatedBall,
			equipment: interpolatedEquipment,
			playerScales,
			equipmentScales,
		}
	}, [keyframes, currentKeyframe, playbackProgress, isPlaying, getElementScale])

	// Animation loop
	useEffect(() => {
		if (!isPlaying || keyframes.length < 2) {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			return
		}

		const totalDuration = animationSpeed * (keyframes.length - 1)

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
	}, [isPlaying, keyframes.length, animationSpeed])

	const interpolatedState = getInterpolatedState()
	const displayState = isPlaying ? interpolatedState : currentKeyframe
	const playerScales = isPlaying ? (interpolatedState as ReturnType<typeof getInterpolatedState>).playerScales || {} : {}
	const equipmentScales = isPlaying ? (interpolatedState as ReturnType<typeof getInterpolatedState>).equipmentScales || {} : {}

	// Mouse event handlers for dragging
	const getSVGCoordinates = (e: React.MouseEvent<SVGSVGElement> | React.DragEvent<SVGSVGElement>) => {
		if (!svgRef.current) return { x: 0, y: 0 }
		const rect = svgRef.current.getBoundingClientRect()
		const x = ((e.clientX - rect.left) / rect.width) * COURT_WIDTH

		// Account for half court view mode where viewBox starts at COURT_HEIGHT/2
		let y: number
		if (courtViewMode === "half") {
			// In half view, the visible area is the bottom half of the court
			y = ((e.clientY - rect.top) / rect.height) * (COURT_HEIGHT / 2) + (COURT_HEIGHT / 2)
		} else {
			y = ((e.clientY - rect.top) / rect.height) * COURT_HEIGHT
		}

		// Keep elements within court boundaries
		return {
			x: Math.max(COURT_PADDING + 10, Math.min(COURT_WIDTH - COURT_PADDING - 10, x)),
			y: Math.max(COURT_PADDING + 10, Math.min(COURT_HEIGHT - COURT_PADDING - 10, y)),
		}
	}

	const handlePlayerMouseDown = (e: React.MouseEvent, playerId: string) => {
		if (isPlaying) return
		e.preventDefault()
		setDraggingPlayer(playerId)
	}

	
	const handleBallMouseDown = (e: React.MouseEvent) => {
		if (isPlaying) return
		e.preventDefault()
		setDraggingBall(true)
	}

	const handleEquipmentMouseDown = (e: React.MouseEvent, equipmentId: string) => {
		if (isPlaying) return
		e.preventDefault()
		setDraggingEquipment(equipmentId)
	}

	const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
		if (!draggingPlayer && !draggingBall && !draggingEquipment) return

		const { x, y } = getSVGCoordinates(e)

		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index !== currentFrameIndex) return frame

				if (draggingPlayer) {
					return {
						...frame,
						players: frame.players.map((p) => (p.id === draggingPlayer ? { ...p, x, y } : p)),
					}
				}

				if (draggingBall) {
					return { ...frame, ball: { x, y } }
				}

				if (draggingEquipment) {
					return {
						...frame,
						equipment: (frame.equipment || []).map((eq) =>
							eq.id === draggingEquipment ? { ...eq, x, y } : eq
						),
					}
				}

				return frame
			})
		)
	}

	const handleMouseUp = () => {
		setDraggingPlayer(null)
		setDraggingBall(false)
		setDraggingEquipment(null)
	}

	// Equipment drag-and-drop from toolbox
	const handleEquipmentDragStart = (type: EquipmentType) => {
		setDraggedEquipmentType(type)
		setDraggingPlayerFromToolbox(false)
	}

	// Player drag-and-drop from toolbox
	const handlePlayerDragStartFromToolbox = () => {
		setDraggingPlayerFromToolbox(true)
		setDraggedEquipmentType(null)
	}

	const handleCourtDragOver = (e: React.DragEvent<SVGSVGElement>) => {
		e.preventDefault()
	}

	const handleCourtDrop = (e: React.DragEvent<SVGSVGElement>) => {
		e.preventDefault()

		const { x, y } = getSVGCoordinates(e)

		// Handle player drop from toolbox
		if (draggingPlayerFromToolbox && !isPlaying) {
			const newPlayerId = `p${Date.now()}`
			const newPlayerIndex = currentKeyframe.players.length
			const newPlayer: PlayerPosition = {
				id: newPlayerId,
				x,
				y,
				color: PLAYER_COLORS[newPlayerIndex % PLAYER_COLORS.length],
				label: String(newPlayerIndex + 1),
				firstFrameIndex: currentFrameIndex,
			}

			// Add to current frame and subsequent frames only
			setKeyframes((prev) =>
				prev.map((frame, index) => {
					if (index < currentFrameIndex) return frame // Skip earlier frames
					return {
						...frame,
						players: [...frame.players, { ...newPlayer }],
					}
				})
			)
			setDraggingPlayerFromToolbox(false)
			return
		}

		// Handle equipment drop from toolbox
		if (!draggedEquipmentType || isPlaying) {
			setDraggedEquipmentType(null)
			return
		}

		const newEquipment: EquipmentItem = {
			id: `eq-${Date.now()}`,
			type: draggedEquipmentType,
			x,
			y,
			firstFrameIndex: currentFrameIndex,
		}

		// Add to current frame and subsequent frames only
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Skip earlier frames
				return {
					...frame,
					equipment: [...(frame.equipment || []), { ...newEquipment }],
				}
			})
		)

		setDraggedEquipmentType(null)
	}

	// Click to add equipment at center of home team's half
	const handleEquipmentClick = (type: EquipmentType) => {
		if (isPlaying) return

		const newEquipment: EquipmentItem = {
			id: `eq-${Date.now()}`,
			type,
			x: COURT_WIDTH / 2 + Math.random() * 60 - 30,
			y: COURT_HEIGHT * 0.65 + Math.random() * 60 - 30,
			firstFrameIndex: currentFrameIndex,
		}

		// Add to current frame and subsequent frames only
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Skip earlier frames
				return {
					...frame,
					equipment: [...(frame.equipment || []), { ...newEquipment }],
				}
			})
		)
	}

	// Click to add player at center of home team's half
	const handlePlayerClick = () => {
		if (isPlaying) return

		const newPlayerId = `p${Date.now()}`
		const newPlayerIndex = currentKeyframe.players.length
		const newPlayer: PlayerPosition = {
			id: newPlayerId,
			x: COURT_WIDTH / 2 + Math.random() * 60 - 30,
			y: COURT_HEIGHT * 0.65 + Math.random() * 60 - 30,
			color: PLAYER_COLORS[newPlayerIndex % PLAYER_COLORS.length],
			label: String(newPlayerIndex + 1),
			firstFrameIndex: currentFrameIndex,
		}

		// Add to current frame and subsequent frames only
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Skip earlier frames
				return {
					...frame,
					players: [...frame.players, { ...newPlayer }],
				}
			})
		)
	}

	// Delete equipment from current frame onwards
	const handleDeleteEquipment = (equipmentId: string) => {
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Keep in earlier frames
				return {
					...frame,
					equipment: (frame.equipment || []).filter((eq) => eq.id !== equipmentId),
				}
			})
		)
	}

	// Delete player from current frame onwards
	const handleDeletePlayer = (playerId: string) => {
		if (currentKeyframe.players.length <= 1) return // Keep at least one player
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				if (index < currentFrameIndex) return frame // Keep in earlier frames
				return {
					...frame,
					players: frame.players.filter((p) => p.id !== playerId),
				}
			})
		)
	}

	// Update element note (persists from current frame onwards, like elements)
	const updateElementNote = (elementType: "player" | "equipment", elementId: string, note: string) => {
		setKeyframes((prev) =>
			prev.map((frame, index) => {
				// Only update current frame and future frames
				if (index < currentFrameIndex) return frame
				if (elementType === "player") {
					return {
						...frame,
						players: frame.players.map((p) => (p.id === elementId ? { ...p, note: note || undefined } : p)),
					}
				} else {
					return {
						...frame,
						equipment: (frame.equipment || []).map((e) => (e.id === elementId ? { ...e, note: note || undefined } : e)),
					}
				}
			})
		)
	}

	// Update element label (applies to all frames where element exists)
	const updateElementLabel = (elementType: "player" | "equipment", elementId: string, label: string) => {
		setKeyframes((prev) =>
			prev.map((frame) => {
				if (elementType === "player") {
					return {
						...frame,
						players: frame.players.map((p) => (p.id === elementId ? { ...p, label: label || undefined } : p)),
					}
				} else {
					return {
						...frame,
						equipment: (frame.equipment || []).map((e) => (e.id === elementId ? { ...e, label: label || undefined } : e)),
					}
				}
			})
		)
	}

	// Handle right-click to open context menu
	const handleElementRightClick = (
		e: React.MouseEvent,
		elementType: "player" | "equipment",
		elementId: string,
		currentLabel: string,
		currentNote: string
	) => {
		if (isPlaying) return
		e.preventDefault()
		e.stopPropagation()

		const rect = containerRef.current?.getBoundingClientRect()
		if (!rect) return

		// Calculate position relative to container, clamped to stay within bounds
		const popupWidth = 180
		const popupHeight = 100
		let x = e.clientX - rect.left + 10
		let y = e.clientY - rect.top + 10

		// Clamp to container bounds
		x = Math.min(x, rect.width - popupWidth)
		y = Math.min(y, rect.height - popupHeight)
		x = Math.max(10, x)
		y = Math.max(10, y)

		setContextMenu({
			elementType,
			elementId,
			currentLabel: currentLabel || "",
			currentNote: currentNote || "",
			position: { x, y },
		})
	}

	// Open label editor from context menu
	const openLabelEditor = () => {
		if (!contextMenu) return
		setEditingLabel({
			elementType: contextMenu.elementType,
			elementId: contextMenu.elementId,
			currentLabel: contextMenu.currentLabel,
			position: contextMenu.position,
		})
		setContextMenu(null)
	}

	// Open note editor from context menu
	const openNoteEditor = () => {
		if (!contextMenu) return
		setEditingNote({
			elementType: contextMenu.elementType,
			elementId: contextMenu.elementId,
			currentNote: contextMenu.currentNote,
			position: contextMenu.position,
		})
		setContextMenu(null)
	}

	// Keyframe management
	const addKeyframe = () => {
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
	}

	const deleteKeyframe = () => {
		if (keyframes.length <= 1) return
		const newKeyframes = keyframes.filter((_, i) => i !== currentFrameIndex)
		setKeyframes(newKeyframes)
		setCurrentFrameIndex(Math.min(currentFrameIndex, newKeyframes.length - 1))
	}

	const goToFrame = (index: number) => {
		setCurrentFrameIndex(index)
		setIsPlaying(false)
		setPlaybackProgress(0)
	}

	const togglePlay = () => {
		if (keyframes.length < 2) return
		if (!isPlaying) {
			setPlaybackProgress(0)
		}
		setIsPlaying(!isPlaying)
	}

	const reset = () => {
		setIsPlaying(false)
		setPlaybackProgress(0)
		setCurrentFrameIndex(0)
	}

	const handleSave = () => {
		const animation: DrillAnimation = {
			keyframes,
			speed: animationSpeed,
		}
		onSave?.(animation)
	}

	return (
		<div className="space-y-6 relative" ref={containerRef}>
			{/* Instructions - Collapsible */}
			<div className="bg-info/10 border border-info/20 rounded-xl overflow-hidden">
				<button
					onClick={() => setInfoCollapsed(!infoCollapsed)}
					className="w-full p-4 flex items-center gap-3 hover:bg-info/5 transition-colors"
				>
					<Info size={18} className="text-info shrink-0" />
					<h3 className="font-medium text-foreground flex-1 text-left">How to create an animation</h3>
					{infoCollapsed ? (
						<ChevronDown size={18} className="text-muted-foreground" />
					) : (
						<ChevronUp size={18} className="text-muted-foreground" />
					)}
				</button>
				{!infoCollapsed && (
					<div className="px-4 pb-4 pl-11">
						<ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
							<li>Drag players and the ball to position them for the first frame</li>
							<li>Double-click a player to edit their label (S, OH, MB, etc.)</li>
							<li>Drag equipment from the toolbox onto the court</li>
							<li>Click "Add Frame" to create keyframes, then reposition for animation</li>
							<li>Press Play to preview, then Save when done</li>
						</ol>
					</div>
				)}
			</div>

			{/* Frame Navigation Bar + Save/Cancel */}
			<div className="space-y-3 bg-card border border-border rounded-lg p-4">
				{/* Top row: Frame info, Add/Delete, Save/Cancel */}
				<div className="flex items-center justify-between">
					{/* Left: Frame info and frame controls */}
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium text-foreground">
							Frame {currentFrameIndex + 1} of {keyframes.length}
						</span>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={addKeyframe} disabled={isPlaying}>
								<Plus className="h-4 w-4 mr-1" /> Add Frame
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={deleteKeyframe}
								disabled={isPlaying || keyframes.length <= 1}
								className="text-red-600 hover:text-red-700"
							>
								<Trash2 className="h-4 w-4 mr-1" /> Delete
							</Button>
						</div>
					</div>

					{/* Right: Save/Cancel buttons */}
					<div className="flex items-center gap-2">
						{onCancel && (
							<Button variant="outline" size="sm" onClick={onCancel}>
								Cancel
							</Button>
						)}
						{onSave && (
							<Button
								onClick={handleSave}
								size="sm"
								className="bg-green-600 hover:bg-green-700"
								disabled={isSaving}
							>
								{isSaving ? (
									<>
										<span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Saving...
									</>
								) : (
									<>
										<Save className="h-4 w-4 mr-1" /> Save
									</>
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Frame thumbnails */}
				<div className="flex gap-2 overflow-x-auto pb-2">
					{keyframes.map((frame, index) => (
						<button
							key={frame.id}
							onClick={() => goToFrame(index)}
							disabled={isPlaying}
							className={`flex-shrink-0 p-1 rounded-lg border-2 transition-all ${
								index === currentFrameIndex
									? "border-blue-500 bg-blue-500/10"
									: "border-border hover:border-muted-foreground"
							}`}
						>
							<div className="relative">
								<svg
									viewBox={courtViewMode === "half"
										? `0 ${COURT_HEIGHT / 2} ${COURT_WIDTH} ${COURT_HEIGHT / 2}`
										: `0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`
									}
									width={50}
									height={courtViewMode === "half" ? 50 : 100}
									className={courtViewMode === "empty" ? "bg-slate-700 rounded" : "bg-green-800 rounded"}
								>
									{/* Mini court lines */}
									{courtViewMode !== "empty" && (
										<>
											<rect x={COURT_PADDING} y={COURT_PADDING} width={COURT_WIDTH - COURT_PADDING * 2} height={COURT_HEIGHT - COURT_PADDING * 2} fill="none" stroke="white" strokeWidth="2" />
											<line x1={COURT_PADDING} y1={COURT_HEIGHT / 2} x2={COURT_WIDTH - COURT_PADDING} y2={COURT_HEIGHT / 2} stroke="white" strokeWidth="2" />
										</>
									)}
									{/* Equipment */}
									{(frame.equipment || []).map((eq) => (
										<circle key={eq.id} cx={eq.x} cy={eq.y} r="8" fill={EQUIPMENT_DEFINITIONS[eq.type].color} />
									))}
									{/* Players */}
									{frame.players.map((player) => (
										<circle key={player.id} cx={player.x} cy={player.y} r="12" fill={player.color} />
									))}
									{/* Ball */}
									<circle cx={frame.ball.x} cy={frame.ball.y} r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
								</svg>
								<span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
									{index + 1}
								</span>
							</div>
						</button>
					))}
				</div>

				</div>

			{/* Playback controls + Speed - sticky */}
			<div className="flex items-center justify-center gap-4 py-3 sticky top-0 z-10 bg-background">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" className="h-8 w-8" onClick={reset} disabled={isPlaying}>
						<SkipBack className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={() => goToFrame(Math.max(0, currentFrameIndex - 1))}
						disabled={isPlaying || currentFrameIndex === 0}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<Button onClick={togglePlay} disabled={keyframes.length < 2} size="sm" className="w-20">
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
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={() => goToFrame(Math.min(keyframes.length - 1, currentFrameIndex + 1))}
						disabled={isPlaying || currentFrameIndex === keyframes.length - 1}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
				{/* Speed control */}
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">Speed:</span>
					<Slider
						value={2000 - animationSpeed}
						onValueChange={(value) => { if (typeof value === 'number') setAnimationSpeed(2000 - value); }}
						min={0}
						max={1500}
						step={100}
						className="w-24"
					/>
					<span className="text-xs text-muted-foreground w-8">{(animationSpeed / 1000).toFixed(1)}s</span>
				</div>
			</div>

			{/* Main layout: Toolbox + Court + Elements Panel */}
			<div className="flex gap-4 justify-center items-start">
				{/* Toolbox column with spacer for alignment */}
				<div className="flex flex-col gap-2">
					{/* Spacer to align with court (matches view selector height) */}
					<div className="h-[34px]" />
					<EquipmentToolbox
						onDragStart={handleEquipmentDragStart}
						onPlayerDragStart={handlePlayerDragStartFromToolbox}
						onClick={handleEquipmentClick}
						onPlayerClick={handlePlayerClick}
						isPlaying={isPlaying}
					/>
				</div>

				{/* Court column with view selector */}
				<div className="flex flex-col gap-2">
					{/* Court View Selector */}
					<div className="flex justify-center">
						<div className="inline-flex rounded-lg border border-border overflow-hidden">
							<button
								onClick={() => setCourtViewMode("full")}
								className={`px-3 py-1.5 text-sm font-medium transition-colors ${
									courtViewMode === "full"
										? "bg-primary text-primary-foreground"
										: "bg-card hover:bg-muted text-foreground"
								}`}
							>
								Full Court
							</button>
							<button
								onClick={() => setCourtViewMode("half")}
								className={`px-3 py-1.5 text-sm font-medium transition-colors border-x border-border ${
									courtViewMode === "half"
										? "bg-primary text-primary-foreground"
										: "bg-card hover:bg-muted text-foreground"
								}`}
							>
								Half Court
							</button>
							<button
								onClick={() => setCourtViewMode("empty")}
								className={`px-3 py-1.5 text-sm font-medium transition-colors ${
									courtViewMode === "empty"
										? "bg-primary text-primary-foreground"
										: "bg-card hover:bg-muted text-foreground"
								}`}
							>
								Empty Canvas
							</button>
						</div>
					</div>

					{/* Court */}
					<div className="border-2 border-gray-600 rounded-lg overflow-hidden">
						<VolleyballCourt
							svgRef={svgRef}
							width={400}
							height={800}
							viewMode={courtViewMode}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onMouseLeave={handleMouseUp}
							onDragOver={handleCourtDragOver}
							onDrop={handleCourtDrop}
						>
						{/* Render equipment */}
						{(displayState.equipment || []).map((item) => {
							const scale = equipmentScales[item.id] ?? 1
							return (
								<EquipmentSVG
									key={item.id}
									item={item}
									isDragging={draggingEquipment === item.id}
									onMouseDown={(e) => handleEquipmentMouseDown(e, item.id)}
									onDelete={() => handleDeleteEquipment(item.id)}
									onDeleteNote={() => updateElementNote("equipment", item.id, "")}
									onContextMenu={(e) => handleElementRightClick(e, "equipment", item.id, item.label || "", item.note || "")}
									scale={scale}
									isPlaying={isPlaying}
								/>
							)
						})}

						{/* Render players */}
						{displayState.players.map((player) => {
							const scale = playerScales[player.id] ?? 1
							// Don't render if scale is 0
							if (scale === 0) return null
							// Apply scale transform centered on player position
							const transform = scale !== 1 ? `translate(${player.x}, ${player.y}) scale(${scale}) translate(${-player.x}, ${-player.y})` : undefined

							return (
								<g
									key={player.id}
									onMouseDown={!isPlaying ? (e) => handlePlayerMouseDown(e, player.id) : undefined}
									onContextMenu={(e) => handleElementRightClick(e, "player", player.id, player.label || "", player.note || "")}
									onMouseEnter={() => !isPlaying && setHoveredPlayer(player.id)}
									onMouseLeave={() => setHoveredPlayer(null)}
									style={{ cursor: isPlaying ? "default" : "grab" }}
									className="group"
									transform={transform}
								>
									<circle
										cx={player.x}
										cy={player.y}
										r="14"
										fill={player.color}
										stroke={draggingPlayer === player.id ? "yellow" : "white"}
										strokeWidth={draggingPlayer === player.id ? "3" : "2"}
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
											onDelete={() => updateElementNote("player", player.id, "")}
											isPlaying={isPlaying}
										/>
									)}
									{/* Delete button on hover */}
									{!isPlaying && currentKeyframe.players.length > 1 && (
										<g
											className="opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => {
												e.stopPropagation()
												handleDeletePlayer(player.id)
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
									{hoveredPlayer === player.id && !draggingPlayer && !isPlaying && (
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
												Right-click for options
											</text>
										</g>
									)}
								</g>
							)
						})}

						{/* Render ball with tooltip */}
						<g
							onMouseDown={!isPlaying ? handleBallMouseDown : undefined}
							onMouseEnter={() => setHoveredBall(true)}
							onMouseLeave={() => setHoveredBall(false)}
							style={{ cursor: isPlaying ? "default" : "grab" }}
						>
							<circle
								cx={displayState.ball.x}
								cy={displayState.ball.y}
								r="8"
								fill="#fef3c7"
								stroke={draggingBall ? "yellow" : "#f59e0b"}
								strokeWidth={draggingBall ? "3" : "2"}
							/>
							{/* Volleyball pattern */}
							<path
								d={`M ${displayState.ball.x - 5} ${displayState.ball.y} Q ${displayState.ball.x} ${displayState.ball.y - 6} ${displayState.ball.x + 5} ${displayState.ball.y}`}
								fill="none"
								stroke="#f59e0b"
								strokeWidth="1"
								style={{ pointerEvents: "none" }}
							/>
							<path
								d={`M ${displayState.ball.x - 5} ${displayState.ball.y} Q ${displayState.ball.x} ${displayState.ball.y + 6} ${displayState.ball.x + 5} ${displayState.ball.y}`}
								fill="none"
								stroke="#f59e0b"
								strokeWidth="1"
								style={{ pointerEvents: "none" }}
							/>
							{/* Tooltip */}
							{hoveredBall && !draggingBall && !isPlaying && (
								<g style={{ pointerEvents: "none" }}>
									<rect
										x={displayState.ball.x - 35}
										y={displayState.ball.y - 30}
										width="70"
										height="18"
										rx="4"
										fill="rgba(0,0,0,0.85)"
									/>
									<text
										x={displayState.ball.x}
										y={displayState.ball.y - 18}
										textAnchor="middle"
										fontSize="10"
										fill="white"
									>
										Volleyball
									</text>
								</g>
							)}
						</g>
						</VolleyballCourt>
					</div>
				</div>

				{/* Elements Panel column with spacer for alignment */}
				<div className="flex flex-col gap-2">
					{/* Spacer to align with court (matches view selector height) */}
					<div className="h-[34px]" />
					<ElementsPanel
						players={displayState.players}
						equipment={displayState.equipment || []}
						onDeletePlayer={handleDeletePlayer}
						onDeleteEquipment={handleDeleteEquipment}
						isPlaying={isPlaying}
					/>
				</div>
			</div>

			{/* Context menu */}
			{contextMenu && (
				<ElementContextMenu
					position={contextMenu.position}
					onChangeLabel={openLabelEditor}
					onAddNote={openNoteEditor}
					onClose={() => setContextMenu(null)}
				/>
			)}

			{/* Label editor popup */}
			{editingLabel && (
				<LabelEditor
					currentLabel={editingLabel.currentLabel}
					position={editingLabel.position}
					onUpdate={(label) => updateElementLabel(editingLabel.elementType, editingLabel.elementId, label)}
					onClose={() => setEditingLabel(null)}
				/>
			)}

			{/* Note editor popup */}
			{editingNote && (
				<NoteEditor
					currentNote={editingNote.currentNote}
					position={editingNote.position}
					onUpdate={(note) => updateElementNote(editingNote.elementType, editingNote.elementId, note)}
					onClose={() => setEditingNote(null)}
				/>
			)}

			</div>
	)
}
