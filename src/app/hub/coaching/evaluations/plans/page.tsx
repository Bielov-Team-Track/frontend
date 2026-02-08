"use client";

import { Button } from "@/components";
import { EmptyState, Loader } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanCard, PlanListItem } from "@/components/features/evaluations/plans";
import { useMyEvaluationPlans } from "@/hooks/useEvaluationPlans";
import { ArrowUpDown, ChevronDown, Clock, FileText, Grid, List, Plus, Search } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

type PlanSortBy = "createdAt" | "name" | "exerciseCount";
type PlanSortOrder = "asc" | "desc";

interface PlanSortOption {
	label: string;
	sortBy: PlanSortBy;
	sortOrder: PlanSortOrder;
}

const PLAN_SORT_OPTIONS: PlanSortOption[] = [
	{ label: "Newest First", sortBy: "createdAt", sortOrder: "desc" },
	{ label: "Oldest First", sortBy: "createdAt", sortOrder: "asc" },
	{ label: "Name (A-Z)", sortBy: "name", sortOrder: "asc" },
	{ label: "Name (Z-A)", sortBy: "name", sortOrder: "desc" },
	{ label: "Most Exercises", sortBy: "exerciseCount", sortOrder: "desc" },
	{ label: "Fewest Exercises", sortBy: "exerciseCount", sortOrder: "asc" },
];

export default function EvaluationPlansPage() {
	const { data: plans = [], isLoading, error } = useMyEvaluationPlans();

	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<PlanSortBy>("createdAt");
	const [sortOrder, setSortOrder] = useState<PlanSortOrder>("desc");
	const [showSortDropdown, setShowSortDropdown] = useState(false);
	const sortDropdownRef = useRef<HTMLDivElement>(null);

	// Close sort dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
				setShowSortDropdown(false);
			}
		};

		if (showSortDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showSortDropdown]);

	const currentSort = PLAN_SORT_OPTIONS.find(
		(opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder
	) || PLAN_SORT_OPTIONS[0];

	// Client-side filtering and sorting
	const filteredPlans = useMemo(() => {
		const filtered = plans.filter((plan) => {
			if (search) {
				const q = search.toLowerCase();
				const matches =
					(plan.name && plan.name.toLowerCase().includes(q)) ||
					(plan.notes && plan.notes.toLowerCase().includes(q)) ||
					plan.items.some((item) => item.exercise.name.toLowerCase().includes(q));
				if (!matches) return false;
			}
			return true;
		});

		return [...filtered].sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "createdAt":
					comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
					break;
				case "name":
					comparison = (a.name || "").localeCompare(b.name || "");
					break;
				case "exerciseCount":
					comparison = a.items.length - b.items.length;
					break;
				default:
					comparison = 0;
			}
			return sortOrder === "desc" ? -comparison : comparison;
		});
	}, [search, plans, sortBy, sortOrder]);

	const hasFilters = !!search;

	const clearFilters = () => {
		setSearch("");
	};

	const handleSortChange = (newSortBy: PlanSortBy, newSortOrder: PlanSortOrder) => {
		setSortBy(newSortBy);
		setSortOrder(newSortOrder);
	};

	if (error) {
		return (
			<div className="space-y-6">
				<EmptyState
					icon={FileText}
					title="Failed to load evaluation plans"
					description="There was an error loading your evaluation plans. Please try again."
					action={{ label: "Retry", onClick: () => window.location.reload() }}
				/>
			</div>
		);
	}

	const renderContent = () => (
		<>
			{/* Results Header */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{filteredPlans.length} plan{filteredPlans.length !== 1 ? "s" : ""}
					{hasFilters && " (filtered)"}
				</p>
				<div className="flex items-center gap-3">
					{/* Sort Dropdown */}
					<div className="relative" ref={sortDropdownRef}>
						<button
							type="button"
							onClick={() => setShowSortDropdown(!showSortDropdown)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
						>
							<ArrowUpDown size={14} />
							<span className="hidden sm:inline">{currentSort.label}</span>
							<ChevronDown
								size={12}
								className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
							/>
						</button>

						{showSortDropdown && (
							<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden">
								{PLAN_SORT_OPTIONS.map((option) => {
									const isSelected = option.sortBy === sortBy && option.sortOrder === sortOrder;
									return (
										<button
											key={`${option.sortBy}-${option.sortOrder}`}
											type="button"
											onClick={() => {
												handleSortChange(option.sortBy, option.sortOrder);
												setShowSortDropdown(false);
											}}
											className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors text-left ${
												isSelected
													? "bg-foreground/5 text-foreground"
													: "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
											}`}
										>
											<Clock size={14} />
											{option.label}
										</button>
									);
								})}
							</div>
						)}
					</div>

					{/* View Switcher */}
					<TabsList size="sm" className="border rounded-xl">
						<TabsTrigger value="list">
							<List size={18} />
						</TabsTrigger>
						<TabsTrigger value="grid">
							<Grid size={18} />
						</TabsTrigger>
					</TabsList>
				</div>
			</div>

			{/* Plans Display */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader />
				</div>
			) : filteredPlans.length === 0 ? (
				<EmptyState
					icon={FileText}
					title={hasFilters ? "No plans found" : "No evaluation plans yet"}
					description={
						hasFilters
							? "Try adjusting your search"
							: "Create an evaluation plan from an event to organize exercises into assessment workflows."
					}
					action={
						hasFilters
							? { label: "Clear Filters", onClick: clearFilters }
							: { label: "Browse Events", onClick: () => (window.location.href = "/hub/events") }
					}
				/>
			) : (
				<>
					<TabsContent value="list">
						<div className="space-y-2">
							{filteredPlans.map((plan) => (
								<PlanListItem key={plan.id} plan={plan} />
							))}
						</div>
					</TabsContent>
					<TabsContent value="grid">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredPlans.map((plan) => (
								<PlanCard key={plan.id} plan={plan} />
							))}
						</div>
					</TabsContent>
				</>
			)}
		</>
	);

	return (
		<Tabs defaultValue="list" className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
						<FileText size={28} className="text-violet-400" />
						Evaluation Plans
					</h1>
					<p className="text-muted-foreground mt-1">
						Organize exercises into comprehensive evaluation workflows
					</p>
				</div>
				<Link href="/hub/events">
					<Button color="primary" leftIcon={<Plus size={16} />}>
						Create Plan
					</Button>
				</Link>
			</div>

			{/* Search */}
			<div className="relative">
				<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search plans by name, notes, or exercise..."
					className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
				/>
			</div>

			{/* Content */}
			<div className="space-y-4">{renderContent()}</div>
		</Tabs>
	);
}
