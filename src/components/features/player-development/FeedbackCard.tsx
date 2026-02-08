"use client";

import { Avatar } from "@/components";
import { ViewMode } from "@/components/ui/list-toolbar";
import { BadgeType, BADGE_METADATA } from "@/lib/models/Evaluation";
import { Feedback } from "@/lib/models/Feedback";
import { Award, Dumbbell, MessageSquare } from "lucide-react";

interface FeedbackCardProps {
	feedback: Feedback;
	viewMode: ViewMode;
	onClick: () => void;
}

export function FeedbackCard({ feedback, viewMode, onClick }: FeedbackCardProps) {
	const totalDrills = feedback.improvementPoints.reduce(
		(sum, point) => sum + (point.attachedDrills?.length || 0),
		0
	);

	const totalPoints = feedback.improvementPoints.length;

	const formattedDate = feedback.createdAt?.toLocaleDateString();
	const eventLabel = feedback.eventId ? "Event Feedback" : "General Feedback";

	const badgeName = feedback.praise?.badgeType
		? BADGE_METADATA[feedback.praise.badgeType as BadgeType]?.name
		: null;

	if (viewMode === "list") {
		return (
			<button
				onClick={onClick}
				className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-left">
				<Avatar name={feedback.coachUserId} size="sm" />

				<div className="flex-1 min-w-0 flex items-center gap-4">
					<div className="flex-1 min-w-0">
						<h3 className="font-medium text-foreground truncate">Coach {feedback.coachUserId.slice(0, 8)}</h3>
						<p className="text-sm text-muted-foreground">{eventLabel}</p>
					</div>

					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<span>{formattedDate}</span>
						<span className="flex items-center gap-1">
							<MessageSquare size={14} />
							{totalPoints} {totalPoints === 1 ? "point" : "points"}
						</span>
						<span className="flex items-center gap-1">
							<Dumbbell size={14} />
							{totalDrills} {totalDrills === 1 ? "drill" : "drills"}
						</span>
						{badgeName && (
							<span className="flex items-center gap-1 text-primary">
								<Award size={14} />
								{badgeName}
							</span>
						)}
					</div>
				</div>
			</button>
		);
	}

	return (
		<button
			onClick={onClick}
			className="w-full text-left rounded-xl bg-surface/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all p-5 space-y-4">
			{/* Header */}
			<div className="flex items-start justify-between gap-3">
				<Avatar name={feedback.coachUserId} size="md" />
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-foreground">Coach {feedback.coachUserId.slice(0, 8)}</h3>
					<p className="text-sm text-muted-foreground">{formattedDate}</p>
				</div>
				{badgeName && (
					<div className="flex items-center gap-1 text-primary text-sm">
						<Award size={16} />
						<span className="hidden sm:inline">{badgeName}</span>
					</div>
				)}
			</div>

			{/* Event */}
			<div className="text-sm">
				<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent">
					{eventLabel}
				</span>
			</div>

			{/* Comment Preview */}
			{feedback.comment && (
				<p className="text-sm text-muted-foreground line-clamp-3">{feedback.comment}</p>
			)}

			{/* Footer Meta */}
			<div className="flex items-center gap-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
				<span className="flex items-center gap-1">
					<MessageSquare size={14} />
					{totalPoints} {totalPoints === 1 ? "point" : "points"}
				</span>
				<span className="flex items-center gap-1">
					<Dumbbell size={14} />
					{totalDrills} {totalDrills === 1 ? "drill" : "drills"}
				</span>
			</div>
		</button>
	);
}
