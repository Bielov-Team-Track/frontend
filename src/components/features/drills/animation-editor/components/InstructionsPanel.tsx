import React from "react"
import { HelpCircle } from "lucide-react"

const InstructionsPanelInner = () => {
	return (
		<a
			href="/docs/animation-editor"
			target="_blank"
			rel="noopener noreferrer"
			className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
		>
			<HelpCircle size={14} />
			<span>How to use the animation editor</span>
		</a>
	)
}

const InstructionsPanel = React.memo(InstructionsPanelInner)

InstructionsPanel.displayName = "InstructionsPanel"

export default InstructionsPanel
