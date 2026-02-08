import React from "react"
import { Info, ChevronDown, ChevronUp } from "lucide-react"

interface InstructionsPanelProps {
	collapsed: boolean
	onToggle: () => void
}

const InstructionsPanelInner = ({ collapsed, onToggle }: InstructionsPanelProps) => {
	return (
		<div className="bg-info/10 border border-info/20 rounded-xl overflow-hidden">
			<button
				onClick={onToggle}
				className="w-full p-4 flex items-center gap-3 hover:bg-info/5 transition-colors"
			>
				<Info size={18} className="text-info shrink-0" />
				<h3 className="font-medium text-foreground flex-1 text-left">How to create an animation</h3>
				{collapsed ? (
					<ChevronDown size={18} className="text-muted-foreground" />
				) : (
					<ChevronUp size={18} className="text-muted-foreground" />
				)}
			</button>
			{!collapsed && (
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
	)
}

const InstructionsPanel = React.memo(InstructionsPanelInner, (prev, next) => {
	return prev.collapsed === next.collapsed
})

InstructionsPanel.displayName = "InstructionsPanel"

export default InstructionsPanel
