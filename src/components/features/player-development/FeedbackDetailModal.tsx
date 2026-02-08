"use client";

import { Avatar, Modal } from "@/components";
import { BadgeType, BADGE_METADATA } from "@/lib/models/Evaluation";
import { Feedback } from "@/lib/models/Feedback";
import { Award, Dumbbell, ExternalLink } from "lucide-react";

interface FeedbackDetailModalProps {
	feedback: Feedback | null;
	isOpen: boolean;
	onClose: () => void;
}

export function FeedbackDetailModal({ feedback, isOpen, onClose }: FeedbackDetailModalProps) {
	if (!feedback) return null;

	const formattedDate = feedback.createdAt?.toLocaleDateString();
	const badgeMetadata = feedback.praise?.badgeType
		? BADGE_METADATA[feedback.praise.badgeType as BadgeType]
		: null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-3">
					<Avatar name={feedback.coachUserId} size="lg" />
					<div>
						<h2 className="text-xl font-bold text-foreground">
							Coach {feedback.coachUserId.slice(0, 8)}
						</h2>
						<p className="text-sm text-muted-foreground">{formattedDate}</p>
					</div>
				</div>

				{/* Comment */}
				{feedback.comment && (
					<div className="rounded-lg bg-muted/50 p-4">
						<p className="text-sm text-foreground whitespace-pre-wrap">{feedback.comment}</p>
					</div>
				)}

				{/* Improvement Points */}
				{feedback.improvementPoints.length > 0 && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">Areas for Improvement</h3>
						<ol className="space-y-4 list-decimal list-inside">
							{feedback.improvementPoints
								.sort((a, b) => a.order - b.order)
								.map((point) => (
									<li key={point.id} className="space-y-3">
										<div className="text-sm text-foreground">{point.description}</div>

										{/* Attached Drills */}
										{point.attachedDrills && point.attachedDrills.length > 0 && (
											<div className="ml-6 space-y-2">
												<p className="text-xs font-medium text-muted-foreground">
													Recommended Drills:
												</p>
												<div className="flex flex-wrap gap-2">
													{point.attachedDrills.map((drill) => (
														<span
															key={drill.id}
															className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium">
															<Dumbbell size={12} />
															{drill.name}
														</span>
													))}
												</div>
											</div>
										)}

										{/* Media Links */}
										{point.mediaLinks && point.mediaLinks.length > 0 && (
											<div className="ml-6 space-y-2">
												<p className="text-xs font-medium text-muted-foreground">Resources:</p>
												<div className="space-y-1">
													{point.mediaLinks.map((media) => (
														<a
															key={media.id}
															href={media.url}
															target="_blank"
															rel="noopener noreferrer"
															className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors">
															<ExternalLink size={12} />
															<span>{media.title || media.url}</span>
														</a>
													))}
												</div>
											</div>
										)}
									</li>
								))}
						</ol>
					</div>
				)}

				{/* Praise */}
				{feedback.praise && (
					<div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
						<div className="flex items-center gap-2">
							<Award size={18} className="text-primary" />
							<h3 className="text-base font-semibold text-primary">
								{badgeMetadata?.name || "Praise"}
							</h3>
						</div>
						<p className="text-sm text-foreground">{feedback.praise.message}</p>
						{badgeMetadata && (
							<p className="text-xs text-muted-foreground italic">{badgeMetadata.description}</p>
						)}
					</div>
				)}
			</div>
		</Modal>
	);
}
