"use client";

import { Button } from "@/components";
import { EmptyState, Loader } from "@/components/ui";
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, FileText, Plus, Target, Trash2, X } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { SKILL_COLORS, METRIC_TYPE_CONFIG, getExerciseSkills } from "@/components/features/evaluations/types";
import type { EvaluationPlan, EvaluationPlanItem } from "@/lib/models/Evaluation";

// NOTE: Since plans can only be fetched by eventId, not by plan ID directly,
// this page will show a message explaining that plans should be accessed via events.
// In a real implementation, you would either:
// 1. Add a getEvaluationPlanById endpoint to the API
// 2. Store the eventId in the route or state
// 3. Make this page redirect to the event page

export default function PlanDetailPage() {
	const params = useParams();
	const planId = params.id as string;

	// For now, show an informational message
	return (
		<div className="max-w-4xl mx-auto">
			{/* Navigation */}
			<div className="flex items-center justify-between mb-8">
				<Link
					href="/dashboard/coaching/evaluations/plans"
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Plans
				</Link>
			</div>

			{/* Informational Message */}
			<div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 p-8">
				<div className="flex flex-col items-center text-center gap-4">
					<div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
						<FileText size={32} className="text-violet-400" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Access Plans Through Events
						</h2>
						<p className="text-muted-foreground leading-relaxed max-w-lg">
							Evaluation plans are managed within their associated events. To view and edit this plan, please navigate to the event it belongs to.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3 mt-4">
						<Link href="/dashboard/events">
							<Button variant="outline">
								Browse Events
							</Button>
						</Link>
						<Link href="/dashboard/coaching/evaluations">
							<Button color="primary">
								Evaluations Hub
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Example Plan Layout (if we had the data) */}
			<div className="mt-12">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
					What You'll See in an Event's Plan
				</h3>
				<div className="space-y-4">
					<div className="p-5 rounded-xl bg-surface/50 border border-border border-dashed">
						<div className="flex items-start gap-3">
							<span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0">
								1
							</span>
							<div className="flex-1">
								<p className="text-sm font-medium text-foreground">Exercise Name</p>
								<p className="text-xs text-muted-foreground mt-1">
									View metrics, skill weights, and max points for each exercise
								</p>
							</div>
						</div>
					</div>
					<div className="p-5 rounded-xl bg-surface/50 border border-border border-dashed">
						<div className="flex items-start gap-3">
							<span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0">
								2
							</span>
							<div className="flex-1">
								<p className="text-sm font-medium text-foreground">Exercise Name</p>
								<p className="text-xs text-muted-foreground mt-1">
									Reorder exercises, add new ones, or remove them from the plan
								</p>
							</div>
						</div>
					</div>
					<div className="p-5 rounded-xl bg-surface/50 border border-border border-dashed">
						<div className="flex items-start gap-3">
							<span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0">
								3
							</span>
							<div className="flex-1">
								<p className="text-sm font-medium text-foreground">Exercise Name</p>
								<p className="text-xs text-muted-foreground mt-1">
									Use the plan to evaluate players during the event
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
