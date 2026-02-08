"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface MediaStripEmptyState {
	icon: LucideIcon;
	title: string;
	description?: string;
}

interface MediaStripProps {
	title: string;
	count: number;
	children: React.ReactNode;
	/** Show a simple "+" card that calls onAdd */
	canEdit?: boolean;
	onAdd?: () => void;
	addLabel?: string;
	/** Or provide a custom add button element (e.g. AddMediaMenu dropdown) */
	addButton?: React.ReactNode;
	viewAllHref?: string;
	/** Always render the section even when count is 0 and canEdit is false */
	alwaysShow?: boolean;
	/** Empty state shown when count is 0 (only for editors) */
	emptyState?: MediaStripEmptyState;
}

export default function MediaStrip({
	title,
	count,
	children,
	canEdit,
	onAdd,
	addLabel = "Add",
	addButton,
	viewAllHref,
	alwaysShow,
	emptyState,
}: MediaStripProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const isEmpty = count === 0;

	const scroll = (direction: "left" | "right") => {
		if (!scrollRef.current) return;
		const amount = 300;
		scrollRef.current.scrollBy({
			left: direction === "left" ? -amount : amount,
			behavior: "smooth",
		});
	};

	const EmptyIcon = emptyState?.icon;

	if (count === 0 && !canEdit && !alwaysShow) return null;

	return (
		<section>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2.5">
					<h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">{title}</h2>
					{count > 0 && (
						<span className="text-xs text-muted bg-white/5 px-2 py-0.5 rounded-full">{count}</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					{/* Custom add button (e.g. AddMediaMenu dropdown) */}
					{addButton}

					{/* Simple add button */}
					{!addButton && canEdit && onAdd && (
						<button
							type="button"
							onClick={onAdd}
							className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted hover:text-white bg-white/[0.02] hover:bg-white/5 border border-dashed border-white/10 hover:border-white/20 transition-all group"
						>
							<Plus size={14} className="text-muted group-hover:text-accent transition-colors" />
							{addLabel}
						</button>
					)}

					{count > 3 && (
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={() => scroll("left")}
								className="p-1 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
							>
								<ChevronLeft size={16} />
							</button>
							<button
								type="button"
								onClick={() => scroll("right")}
								className="p-1 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
							>
								<ChevronRight size={16} />
							</button>
						</div>
					)}
					{viewAllHref && count > 6 && (
						<Link
							href={viewAllHref}
							className="text-xs text-accent hover:text-accent/80 transition-colors"
						>
							View all
						</Link>
					)}
				</div>
			</div>

			{/* Content */}
			{isEmpty && emptyState && EmptyIcon ? (
				<div className="flex items-center gap-4 py-8 px-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
					<EmptyIcon size={28} className="text-white/20 shrink-0" />
					<div>
						<p className="text-sm font-medium text-white/40">{emptyState.title}</p>
						{emptyState.description && (
							<p className="text-xs text-white/25 mt-0.5">{emptyState.description}</p>
						)}
					</div>
				</div>
			) : (
				<div
					ref={scrollRef}
					className="flex gap-3 overflow-x-auto scrollbar-none pb-1"
				>
					{children}
				</div>
			)}
		</section>
	);
}
