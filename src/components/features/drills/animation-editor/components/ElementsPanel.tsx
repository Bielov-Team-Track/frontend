import React, { useState } from "react"
import { Users, ChevronDown, ChevronRight, X } from "lucide-react"
import type { PlayerPosition, EquipmentItem } from "../../types"
import { EQUIPMENT_DEFINITIONS } from "../../types"

interface ElementsPanelProps {
	players: PlayerPosition[]
	equipment: EquipmentItem[]
	isPlaying: boolean
	onDeletePlayer: (id: string) => void
	onDeleteEquipment: (id: string) => void
}

const ElementsPanelInner = ({
	players,
	equipment,
	onDeletePlayer,
	onDeleteEquipment,
	isPlaying,
}: ElementsPanelProps) => {
	const [collapsed, setCollapsed] = useState(false)

	return (
		<div className="w-48 bg-card border border-border rounded-lg h-fit flex flex-col">
			{/* Collapsible header */}
			<button
				onClick={() => setCollapsed(prev => !prev)}
				className="w-full flex items-center gap-2 text-sm font-medium text-foreground p-3 pb-2 hover:bg-hover rounded-t-lg transition-colors shrink-0"
			>
				{collapsed
					? <ChevronRight className="h-4 w-4 text-muted-foreground" />
					: <ChevronDown className="h-4 w-4 text-muted-foreground" />
				}
				<Users className="h-4 w-4 text-muted-foreground" />
				Elements
				<span className="text-xs text-muted-foreground ml-auto">{players.length + equipment.length}</span>
			</button>

			{!collapsed && (
				<div className="overflow-y-auto px-3 pb-3 space-y-3 max-h-[240px] min-h-0">
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
									disabled={isPlaying}
									className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted-foreground/20 text-muted-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
									title="Delete player"
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
			)}
		</div>
	)
}

const ElementsPanel = React.memo(ElementsPanelInner, (prev, next) => {
	return (
		prev.players === next.players &&
		prev.equipment === next.equipment &&
		prev.isPlaying === next.isPlaying
	)
})

ElementsPanel.displayName = "ElementsPanel"

export default ElementsPanel
