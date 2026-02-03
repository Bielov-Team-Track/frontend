"use client";

import { useState, useRef } from "react";
import { Button } from "@/components";
import {
	TemplateInteractionBar,
	TemplateCommentsSection,
} from "@/components/features/templates";
import { Loader } from "@/components/ui";
import { useTemplate, useCanEditTemplate } from "@/hooks/useTemplates";
import { useAuth } from "@/providers";
import { Clock, FileText, Pencil, ArrowLeft, ChevronRight, ChevronDown } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { TemplateSection } from "@/lib/models/Template";

export default function TemplateDetailPage() {
	const params = useParams();
	const templateId = params.id as string;
	const { userProfile } = useAuth();
	const { data: template, isLoading, error } = useTemplate(templateId);
	const { canEdit } = useCanEditTemplate(template, userProfile?.id);
	const [showEditDropdown, setShowEditDropdown] = useState(false);
	const commentsRef = useRef<HTMLDivElement>(null);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader />
			</div>
		);
	}

	if (error || !template) {
		notFound();
	}

	// Group items by section
	const sections = template.sections || [];
	const ungroupedItems = template.items?.filter((item) => !item.sectionId) || [];

	// Placeholder for "Use in Event" functionality
	const handleUseInEvent = () => {
		// TODO: Implement in Task 27 - Open modal to select event
		alert("Use in Event feature coming soon! This will open a modal to select an event.");
	};

	return (
		<div className="max-w-4xl mx-auto">
			{/* Navigation */}
			<div className="flex items-center justify-between mb-8">
				<Link
					href="/dashboard/training/plans"
					className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Plans
				</Link>
				{canEdit && (
					<div className="relative">
						<Button
							variant="ghost"
							color="neutral"
							size="sm"
							leftIcon={<Pencil size={14} />}
							rightIcon={<ChevronDown size={14} />}
							onClick={() => setShowEditDropdown(!showEditDropdown)}
						>
							Edit
						</Button>
						{showEditDropdown && (
							<div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1A1A1A] border border-white/10 shadow-lg overflow-hidden z-10">
								<Link
									href={`/dashboard/training/plans/${templateId}/edit`}
									className="block px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
									onClick={() => setShowEditDropdown(false)}
								>
									Edit Details
								</Link>
								<Link
									href={`/dashboard/training/plans/${templateId}/edit-drills`}
									className="block px-4 py-2.5 text-sm text-muted hover:text-white hover:bg-white/5 transition-colors"
									onClick={() => setShowEditDropdown(false)}
								>
									Edit Drills
								</Link>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Hero Section */}
			<header className="mb-10">
				{/* Title */}
				<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-5">{template.name}</h1>

				{/* Meta chips */}
				<div className="flex flex-wrap items-center gap-3">
					<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm text-muted">
						<Clock size={14} className="text-accent" />
						{template.totalDuration} min
					</span>
					<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm text-muted">
						<FileText size={14} className="text-accent" />
						{template.drillCount} drill{template.drillCount !== 1 ? "s" : ""}
					</span>
					{template.skills.map((skill) => (
						<span
							key={skill}
							className="px-3 py-1.5 rounded-full bg-accent/10 text-sm text-accent font-medium"
						>
							{skill}
						</span>
					))}
				</div>

				{/* Interaction Bar */}
				<div className="mt-6 flex flex-wrap items-center gap-3">
					<TemplateInteractionBar
						templateId={templateId}
						likeCount={template.likeCount}
						commentCount={template.commentCount}
						showComments={true}
						onCommentsClick={() => commentsRef.current?.scrollIntoView({ behavior: "smooth" })}
					/>
					<div className="hidden sm:block w-px h-6 bg-white/10" />
					<Button
						variant="default"
						color="primary"
						size="sm"
						onClick={handleUseInEvent}
					>
						Use in Event
					</Button>
				</div>
			</header>

			{/* Description */}
			{template.description && (
				<p className="text-lg text-muted/90 leading-relaxed mb-10 max-w-2xl">{template.description}</p>
			)}

			{/* Divider */}
			<div className="border-t border-white/10 mb-10" />

			{/* Sections */}
			<div className="space-y-8">
				{sections.map((section) => (
					<SectionBlock key={section.id} section={section} />
				))}

				{/* Ungrouped Items */}
				{ungroupedItems.length > 0 && (
					<section>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">Drills</h2>
							<span className="text-sm text-muted">
								{ungroupedItems.reduce((sum, item) => sum + item.duration, 0)} min
							</span>
						</div>
						<div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
							{ungroupedItems.map((item, idx) => (
								<DrillItemRow
									key={item.id}
									item={item}
									isLast={idx === ungroupedItems.length - 1}
								/>
							))}
						</div>
					</section>
				)}
			</div>

			{/* Divider */}
			<div className="border-t border-white/10 my-10" />

			{/* Comments Section */}
			<div ref={commentsRef}>
				<TemplateCommentsSection templateId={templateId} />
			</div>
		</div>
	);
}

interface SectionBlockProps {
	section: TemplateSection;
}

function SectionBlock({ section }: SectionBlockProps) {
	return (
		<section>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">{section.name}</h2>
				<span className="text-sm text-muted">{section.duration} min</span>
			</div>
			<div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
				{section.items.map((item, idx) => (
					<DrillItemRow
						key={item.id}
						item={item}
						isLast={idx === section.items.length - 1}
					/>
				))}
			</div>
		</section>
	);
}

interface DrillItemRowProps {
	item: {
		id: string;
		drillId: string;
		duration: number;
		notes?: string;
		drill?: {
			id: string;
			name: string;
		};
	};
	isLast: boolean;
}

function DrillItemRow({ item, isLast }: DrillItemRowProps) {
	const drillName = item.drill?.name || "Unknown Drill";

	return (
		<div className={`flex items-center gap-4 p-4 ${!isLast ? "border-b border-white/10" : ""}`}>
			{/* Drill Icon */}
			<div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
				<FileText size={16} className="text-accent" />
			</div>

			{/* Drill Info */}
			<div className="flex-1 min-w-0">
				<Link
					href={`/dashboard/training/drills/${item.drillId}`}
					className="text-white font-medium hover:text-accent transition-colors"
				>
					{drillName}
				</Link>
				{item.notes && <p className="text-sm text-muted/70 mt-0.5">Notes: {item.notes}</p>}
			</div>

			{/* Duration */}
			<div className="flex items-center gap-3">
				<span className="text-sm text-muted">{item.duration} min</span>
				<Link
					href={`/dashboard/training/drills/${item.drillId}`}
					className="text-muted hover:text-accent transition-colors"
				>
					<ChevronRight size={16} />
				</Link>
			</div>
		</div>
	);
}
