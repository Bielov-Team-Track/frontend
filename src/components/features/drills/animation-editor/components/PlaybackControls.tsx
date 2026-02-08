import React from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
	Play,
	Pause,
	SkipBack,
	ChevronLeft,
	ChevronRight,
} from "lucide-react"

interface PlaybackControlsProps {
	isPlaying: boolean
	animationSpeed: number
	frameCount: number
	currentFrameIndex: number
	onTogglePlay: () => void
	onReset: () => void
	onPrevFrame: () => void
	onNextFrame: () => void
	onSpeedChange: (speed: number) => void
}

const PlaybackControlsInner = ({
	isPlaying,
	animationSpeed,
	frameCount,
	currentFrameIndex,
	onTogglePlay,
	onReset,
	onPrevFrame,
	onNextFrame,
	onSpeedChange,
}: PlaybackControlsProps) => {
	return (
		<div className="flex items-center justify-center gap-4 py-3 sticky top-0 z-10 bg-background">
			<div className="flex items-center gap-2">
				<Button variant="outline" size="icon" className="h-8 w-8" onClick={onReset} disabled={isPlaying}>
					<SkipBack className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={onPrevFrame}
					disabled={isPlaying || currentFrameIndex === 0}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button onClick={onTogglePlay} disabled={frameCount < 2} size="sm" className="w-20">
					{isPlaying ? (
						<>
							<Pause className="h-4 w-4 mr-1" /> Pause
						</>
					) : (
						<>
							<Play className="h-4 w-4 mr-1" /> Play
						</>
					)}
				</Button>
				<Button
					variant="outline"
					size="icon"
					className="h-8 w-8"
					onClick={onNextFrame}
					disabled={isPlaying || currentFrameIndex === frameCount - 1}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
			{/* Speed control */}
			<div className="flex items-center gap-2">
				<span className="text-xs text-muted-foreground">Speed:</span>
				<Slider
					value={2000 - animationSpeed}
					onValueChange={(value) => { if (typeof value === 'number') onSpeedChange(2000 - value) }}
					min={0}
					max={1500}
					step={100}
					className="w-24"
				/>
				<span className="text-xs text-muted-foreground w-8">{(animationSpeed / 1000).toFixed(1)}s</span>
			</div>
		</div>
	)
}

const PlaybackControls = React.memo(PlaybackControlsInner)

PlaybackControls.displayName = "PlaybackControls"

export default PlaybackControls
