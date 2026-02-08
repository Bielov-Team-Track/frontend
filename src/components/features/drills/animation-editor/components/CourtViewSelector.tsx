import type { CourtViewMode } from "../../types"

interface CourtViewSelectorProps {
	value: CourtViewMode
	onChange: (mode: CourtViewMode) => void
}

const CourtViewSelector = ({ value, onChange }: CourtViewSelectorProps) => {
	return (
		<div className="flex justify-center">
			<div className="inline-flex rounded-lg border border-border overflow-hidden">
				<button
					onClick={() => onChange("full")}
					className={`px-3 py-1.5 text-sm font-medium transition-colors ${
						value === "full"
							? "bg-primary text-primary-foreground"
							: "bg-card hover:bg-muted text-foreground"
					}`}
				>
					Full Court
				</button>
				<button
					onClick={() => onChange("half")}
					className={`px-3 py-1.5 text-sm font-medium transition-colors border-x border-border ${
						value === "half"
							? "bg-primary text-primary-foreground"
							: "bg-card hover:bg-muted text-foreground"
					}`}
				>
					Half Court
				</button>
				<button
					onClick={() => onChange("empty")}
					className={`px-3 py-1.5 text-sm font-medium transition-colors ${
						value === "empty"
							? "bg-primary text-primary-foreground"
							: "bg-card hover:bg-muted text-foreground"
					}`}
				>
					Empty Canvas
				</button>
			</div>
		</div>
	)
}

export default CourtViewSelector
