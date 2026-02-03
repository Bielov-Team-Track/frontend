"use client";

import { Button } from "@/components";
import { TimelineItem } from "@/components/features/drills";
import { Edit2, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { useEventContext } from "../layout";
import { TrainingEditMode, TrainingViewMode } from "./components";

type Mode = "edit" | "view";

export default function TrainingPlanPage() {
	const { event } = useEventContext();
	const [mode, setMode] = useState<Mode>("edit");
	const [timeline, setTimeline] = useState<TimelineItem[]>([]);

	const eventDuration = useMemo(() => {
		if (!event?.startTime || !event?.endTime) return 90;
		const start = new Date(event.startTime);
		const end = new Date(event.endTime);
		return Math.round((end.getTime() - start.getTime()) / 60000);
	}, [event]);

	if (!event) return null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-white">Training Plan</h2>
					<p className="text-sm text-muted">
						{mode === "edit" ? "Build your training session" : "Running training session"}
					</p>
				</div>

				{/* Mode Toggle */}
				<div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
					<Button
						variant={mode === "edit" ? "default" : "ghost"}
						color={mode === "edit" ? "primary" : "neutral"}
						size="sm"
						leftIcon={<Edit2 size={14} />}
						onClick={() => setMode("edit")}>
						Edit
					</Button>
					<Button
						variant={mode === "view" ? "default" : "ghost"}
						color={mode === "view" ? "primary" : "neutral"}
						size="sm"
						leftIcon={<Play size={14} />}
						onClick={() => timeline.length > 0 && setMode("view")}
						disabled={timeline.length === 0}>
						Run
					</Button>
				</div>
			</div>

			{/* Content */}
			{mode === "edit" ? (
				<TrainingEditMode
					timeline={timeline}
					setTimeline={setTimeline}
					eventDuration={eventDuration}
					onStartTraining={() => setMode("view")}
				/>
			) : (
				<TrainingViewMode timeline={timeline} onExitToEdit={() => setMode("edit")} />
			)}
		</div>
	);
}
