import type { AnimationKeyframe, CourtViewMode } from "../../types"
import { EQUIPMENT_DEFINITIONS } from "../../types"
import { COURT_WIDTH, COURT_HEIGHT, COURT_PADDING } from "../constants"
import CourtLines from "./CourtLines"

interface FrameThumbnailsProps {
	keyframes: AnimationKeyframe[]
	currentFrameIndex: number
	courtViewMode: CourtViewMode
	isPlaying: boolean
	onFrameClick: (index: number) => void
}

// NOT memoized - keyframes change on every mousemove during drag
function FrameThumbnails({
	keyframes,
	currentFrameIndex,
	courtViewMode,
	isPlaying,
	onFrameClick,
}: FrameThumbnailsProps) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-2">
			{keyframes.map((frame, index) => (
				<button
					key={frame.id}
					onClick={() => onFrameClick(index)}
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
							{frame.ball && (
								<circle cx={frame.ball.x} cy={frame.ball.y} r="8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
							)}
						</svg>
						<span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
							{index + 1}
						</span>
					</div>
				</button>
			))}
		</div>
	)
}

export default FrameThumbnails
