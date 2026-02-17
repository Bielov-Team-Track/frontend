import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { SHORTCUT_LEGEND } from "../hooks/useKeyboardShortcuts"

interface ShortcutLegendProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const GROUP_ORDER = ["Playback", "Navigation", "Selection", "Editing", "Animation", "Sport", "Help"]

export default function ShortcutLegend({ open, onOpenChange }: ShortcutLegendProps) {
	const grouped = GROUP_ORDER.map((group) => ({
		group,
		shortcuts: SHORTCUT_LEGEND.filter((s) => s.group === group),
	})).filter((g) => g.shortcuts.length > 0)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Keyboard Shortcuts</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 mt-2">
					{grouped.map(({ group, shortcuts }) => (
						<div key={group}>
							<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
								{group}
							</h3>
							<div className="space-y-1">
								{shortcuts.map((s) => (
									<div key={s.keys} className="flex items-center justify-between py-1">
										<span className="text-sm">{s.description}</span>
										<div className="flex gap-1">
											{s.keys.split("+").map((part, i) => (
												<span key={i}>
													{i > 0 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
													<kbd className="inline-block px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">
														{part.trim()}
													</kbd>
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
