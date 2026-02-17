import { useEffect } from "react"
import { Tag, MessageSquare } from "lucide-react"
import type { ContextMenuState } from "../types"

interface ContextMenuProps {
	state: ContextMenuState
	onClose: () => void
	onEditLabel: () => void
	onEditNote: () => void
}

// Element Context Menu - shows on right-click
// Styled to match DropdownMenuContent for visual consistency
const ContextMenu = ({
	state,
	onClose,
	onEditLabel,
	onEditNote,
}: ContextMenuProps) => {
	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = () => onClose()
		document.addEventListener("click", handleClickOutside)
		return () => document.removeEventListener("click", handleClickOutside)
	}, [onClose])

	return (
		<div
			className="absolute z-50 bg-popover text-popover-foreground ring-foreground/10 min-w-32 rounded-lg p-1 shadow-md ring-1 animate-in fade-in-0 zoom-in-95"
			style={{ left: state.position.x, top: state.position.y }}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				className="w-full gap-1.5 rounded-md px-1.5 py-1 text-sm flex items-center hover:bg-hover outline-none cursor-default"
				onClick={() => onEditLabel()}
			>
				<Tag className="h-4 w-4" />
				Change Label
			</button>
			<button
				className="w-full gap-1.5 rounded-md px-1.5 py-1 text-sm flex items-center hover:bg-hover outline-none cursor-default"
				onClick={() => onEditNote()}
			>
				<MessageSquare className="h-4 w-4" />
				Add Note
			</button>
		</div>
	)
}

export default ContextMenu
