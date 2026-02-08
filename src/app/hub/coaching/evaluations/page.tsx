"use client";

import { ClipboardCheck, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CoachingEvaluationsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
					<ClipboardCheck size={28} className="text-accent" />
					Player Evaluations
				</h1>
				<p className="text-muted-foreground mt-1">
					Create exercises and build evaluation plans to assess player skills systematically
				</p>
			</div>

			{/* Feature Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Exercises Card */}
				<Link
					href="/hub/coaching/evaluations/exercises"
					className="group block p-6 rounded-2xl bg-surface border border-border hover:border-accent/50 hover:bg-hover transition-all"
				>
					<div className="flex items-start gap-4">
						{/* Icon */}
						<div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
							<ClipboardCheck size={24} className="text-accent" />
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<h2 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
								Evaluation Exercises
							</h2>
							<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
								Create and manage exercises to evaluate player skills. Define custom metrics and skill weights for structured assessments.
							</p>
						</div>

						{/* Arrow */}
						<ChevronRight
							size={20}
							className="text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1"
						/>
					</div>
				</Link>

				{/* Plans Card */}
				<Link
					href="/hub/coaching/evaluations/plans"
					className="group block p-6 rounded-2xl bg-surface border border-border hover:border-accent/50 hover:bg-hover transition-all"
				>
					<div className="flex items-start gap-4">
						{/* Icon */}
						<div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
							<FileText size={24} className="text-violet-400" />
						</div>

						{/* Content */}
						<div className="flex-1 min-w-0">
							<h2 className="text-lg font-semibold text-foreground group-hover:text-violet-400 transition-colors">
								Evaluation Plans
							</h2>
							<p className="text-sm text-muted-foreground mt-1 leading-relaxed">
								Build evaluation plans from exercises for events. Organize multiple exercises into comprehensive assessment workflows.
							</p>
						</div>

						{/* Arrow */}
						<ChevronRight
							size={20}
							className="text-muted-foreground group-hover:text-violet-400 transition-colors shrink-0 mt-1"
						/>
					</div>
				</Link>
			</div>

			{/* Info Section */}
			<div className="rounded-xl bg-card/50 border border-border p-6">
				<h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
					How It Works
				</h3>
				<ol className="space-y-3 text-sm text-muted-foreground">
					<li className="flex gap-3">
						<span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
							1
						</span>
						<span>
							<strong className="text-foreground">Create Exercises</strong> - Define individual evaluation exercises with custom metrics and skill weights
						</span>
					</li>
					<li className="flex gap-3">
						<span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
							2
						</span>
						<span>
							<strong className="text-foreground">Build Plans</strong> - Combine exercises into evaluation plans for specific events or tryouts
						</span>
					</li>
					<li className="flex gap-3">
						<span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
							3
						</span>
						<span>
							<strong className="text-foreground">Evaluate Players</strong> - Use plans during events to assess players consistently and track progress
						</span>
					</li>
				</ol>
			</div>
		</div>
	);
}
