import { useState, useRef, useEffect } from "react"
import { X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EditingNoteState } from "../types"

interface NoteEditorProps {
	state: EditingNoteState
	onClose: () => void
	onSave: (newNote: string) => void
}

// Note Editor Popup
const NoteEditor = ({
	state,
	onClose,
	onSave,
}: NoteEditorProps) => {
	const [note, setNote] = useState(state.currentNote)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const popupRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		textareaRef.current?.focus()
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
		onSave(note)
		onClose()
	}

	return (
		<div
			ref={popupRef}
			className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-3 min-w-[250px]"
			style={{ left: state.position.x, top: state.position.y }}
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
								onSave("")
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

export default NoteEditor
