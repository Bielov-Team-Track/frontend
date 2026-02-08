import React, { useState } from "react"
import { GripVertical, ChevronDown, ChevronRight, Search } from "lucide-react"
import type { EquipmentType } from "../../types"
import { EQUIPMENT_DEFINITIONS } from "../../types"
import { PLAYER_COLORS } from "../constants"

interface EquipmentToolboxProps {
	isPlaying: boolean
	currentFrameIndex: number
	onEquipmentDrag: (type: EquipmentType) => void
	onPlayerDrag: () => void
	onEquipmentClick: (type: EquipmentType) => void
	onPlayerClick: () => void
}

const equipmentTypes = Object.entries(EQUIPMENT_DEFINITIONS) as [EquipmentType, { name: string; icon: string; color: string }][]

const EquipmentToolboxInner = ({
	isPlaying,
	onEquipmentDrag,
	onPlayerDrag,
	onEquipmentClick,
	onPlayerClick,
}: EquipmentToolboxProps) => {
	const [collapsed, setCollapsed] = useState(false)
	const [search, setSearch] = useState("")

	const filtered = search
		? equipmentTypes.filter(([, def]) => def.name.toLowerCase().includes(search.toLowerCase()))
		: equipmentTypes

	const showPlayer = !search || "player".includes(search.toLowerCase())

	return (
		<div className="w-48 bg-card border border-border rounded-lg h-fit">
			{/* Collapsible header */}
			<button
				onClick={() => setCollapsed(prev => !prev)}
				className="w-full flex items-center gap-2 text-sm font-medium text-foreground p-3 pb-2 hover:bg-hover rounded-t-lg transition-colors"
			>
				{collapsed
					? <ChevronRight className="h-4 w-4 text-muted-foreground" />
					: <ChevronDown className="h-4 w-4 text-muted-foreground" />
				}
				<GripVertical className="h-4 w-4 text-muted-foreground" />
				Toolbox
			</button>

			{!collapsed && (
				<div className="px-3 pb-3 space-y-2">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search..."
							className="w-full h-7 pl-7 pr-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
						/>
					</div>

					{/* Items list — scrollable */}
					<div className="space-y-2 max-h-[240px] overflow-y-auto">
						{/* Player item */}
						{showPlayer && (
							<div
								draggable={!isPlaying}
								onDragStart={onPlayerDrag}
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
						)}
						{/* Equipment items */}
						{filtered.map(([type, def]) => (
							<div
								key={type}
								draggable={!isPlaying}
								onDragStart={() => onEquipmentDrag(type)}
								onClick={() => !isPlaying && onEquipmentClick(type)}
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
			)}
		</div>
	)
}

const EquipmentToolbox = React.memo(EquipmentToolboxInner, (prev, next) => {
	return (
		prev.isPlaying === next.isPlaying &&
		prev.currentFrameIndex === next.currentFrameIndex
	)
})

EquipmentToolbox.displayName = "EquipmentToolbox"

export default EquipmentToolbox
