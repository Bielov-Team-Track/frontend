import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PLAYER_LABEL_PRESETS } from "../constants"
import type { EditingLabelState } from "../types"

interface LabelEditorProps {
	state: EditingLabelState
	onClose: () => void
	onSave: (newLabel: string) => void
}

// Label Editor Popup
const LabelEditor = ({
	state,
	onClose,
	onSave,
}: LabelEditorProps) => {
	const [label, setLabel] = useState(state.currentLabel)
	const inputRef = useRef<HTMLInputElement>(null)
	const popupRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		inputRef.current?.focus()
		inputRef.current?.select()
	}, [])

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
				onClose()
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [onClose])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSave(label)
		onClose()
	}

	return (
		<div
			ref={popupRef}
			className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[220px]"
			style={{ left: state.position.x, top: state.position.y }}
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

export default LabelEditor
