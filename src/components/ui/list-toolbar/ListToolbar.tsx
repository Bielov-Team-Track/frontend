"use client";

import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownAZ, Grid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Types
export interface SortOption {
	value: string;
	label: string;
	icon?: React.ReactNode;
}

export interface FilterOption {
	id: string;
	label: string;
	options: { value: string; label: string }[];
}

export type ViewMode = "list" | "grid";

interface ListToolbarProps {
	// Search
	search?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;

	// Sort
	sortOptions?: SortOption[];
	sortBy?: string;
	onSortChange?: (value: string) => void;

	// Filters (custom content)
	filterContent?: React.ReactNode;
	activeFilterCount?: number;
	onClearFilters?: () => void;

	// Count
	count: number;
	itemLabel?: string;

	// View mode
	viewMode?: ViewMode;
	onViewModeChange?: (mode: ViewMode) => void;
	showViewToggle?: boolean;

	// Test IDs
	searchTestId?: string;

	// Panel state (controlled from parent if needed)
	defaultPanel?: "search" | "filter" | null;
}

export function ListToolbar({
	search,
	onSearchChange,
	searchPlaceholder = "Search...",
	sortOptions,
	sortBy,
	onSortChange,
	filterContent,
	activeFilterCount = 0,
	onClearFilters,
	count,
	itemLabel = "item",
	viewMode,
	onViewModeChange,
	showViewToggle = true,
	defaultPanel = null,
	searchTestId,
}: ListToolbarProps) {
	const [showFilters, setShowFilters] = useState(false);
	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Focus search input when mobile search opens
	useEffect(() => {
		if (showMobileSearch && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [showMobileSearch]);

	// Close mobile search when search is cleared
	useEffect(() => {
		if (!search && showMobileSearch) {
			// Keep open if user is still typing
		}
	}, [search, showMobileSearch]);

	const currentSort = sortOptions?.find((opt) => opt.value === sortBy) || sortOptions?.[0];
	const hasActiveFilters = activeFilterCount > 0;

	return (
		<div className="space-y-3">
			{/* Main Toolbar Row */}
			<div className="flex items-center gap-2 sm:gap-3">
				{/* Left Side: Count + Search + Filters */}
				<div className="flex items-center gap-2 sm:gap-3">
					{/* Count */}
					<p className="text-sm text-muted-foreground shrink-0">
						{count} {itemLabel}
						{count !== 1 && "s"}
					</p>

					{/* Desktop Search Input - hidden on mobile */}
					{onSearchChange && (
						<div className="relative max-w-xs hidden sm:block">
							<Input
								placeholder={searchPlaceholder}
								leftIcon={<Search size={16} className="text-muted-foreground" />}
								value={search}
								onChange={(e) => onSearchChange(e.target.value)}
								{...(searchTestId ? { "data-testid": searchTestId } : {})}
							/>
							{search && (
								<button
									type="button"
									onClick={() => onSearchChange("")}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
									<X size={14} className="text-muted-foreground" />
								</button>
							)}
						</div>
					)}

					{/* Mobile Search Button - visible only on mobile */}
					{onSearchChange && (
						<button
							type="button"
							onClick={() => setShowMobileSearch(!showMobileSearch)}
							className={cn(
								"sm:hidden p-2 rounded-lg transition-colors",
								showMobileSearch || search
									? "bg-foreground/10 text-foreground"
									: "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
							)}
							aria-label="Toggle search">
							<Search size={18} />
						</button>
					)}

					{/* Filter Button */}
					{filterContent && (
						<button
							type="button"
							onClick={() => setShowFilters(!showFilters)}
							className={cn(
								"inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
								showFilters || hasActiveFilters
									? "bg-foreground/10 text-foreground"
									: "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
							)}
							aria-label="Toggle filters"
							aria-expanded={showFilters}>
							<SlidersHorizontal size={16} />
							<span className="hidden sm:inline">Filters</span>
							{hasActiveFilters && (
								<span className="min-w-5 h-5 flex items-center justify-center text-xs rounded-full bg-accent text-white px-1.5">
									{activeFilterCount}
								</span>
							)}
						</button>
					)}

					{/* Clear Filters */}
					{hasActiveFilters && onClearFilters && (
						<button
							type="button"
							onClick={onClearFilters}
							className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
							Clear
						</button>
					)}
				</div>

				{/* Spacer - pushes right side to the end */}
				<div className="flex-1" />

				{/* Right Side: Sort & View Toggle */}
				<div className="flex items-center gap-2">
					{/* Sort Dropdown */}
					{sortOptions && sortOptions.length > 0 && onSortChange && (
						<Select value={sortBy} onValueChange={(value) => value && onSortChange(value)}>
							<SelectTrigger variant="ghost">
								{currentSort?.icon || <ArrowDownAZ size={14} />}
								<SelectValue>{currentSort?.label}</SelectValue>
							</SelectTrigger>
							<SelectContent align="end">
								{sortOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.icon}
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

					{/* View Toggle */}
					{showViewToggle && viewMode && onViewModeChange && (
						<div className="flex border border-border rounded-lg overflow-hidden">
							<button
								type="button"
								onClick={() => onViewModeChange("list")}
								className={cn(
									"p-1.5 transition-colors",
									viewMode === "list" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"
								)}
								aria-label="List view">
								<List size={16} />
							</button>
							<button
								type="button"
								onClick={() => onViewModeChange("grid")}
								className={cn(
									"p-1.5 transition-colors",
									viewMode === "grid" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"
								)}
								aria-label="Grid view">
								<Grid size={16} />
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Mobile Search Input - expands below toolbar on mobile */}
			<AnimatePresence>
				{showMobileSearch && onSearchChange && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="sm:hidden">
						<div className="relative">
							<Input
								ref={searchInputRef}
								placeholder={searchPlaceholder}
								leftIcon={<Search size={16} className="text-muted-foreground" />}
								value={search}
								onChange={(e) => onSearchChange(e.target.value)}
								{...(searchTestId ? { "data-testid": searchTestId } : {})}
							/>
							{search && (
								<button
									type="button"
									onClick={() => {
										onSearchChange("");
										setShowMobileSearch(false);
									}}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
									<X size={14} className="text-muted-foreground" />
								</button>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Desktop Filter Panel - inline expandable */}
			<AnimatePresence>
				{showFilters && filterContent && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="hidden sm:block overflow-hidden">
						{filterContent}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Mobile Filter Drawer */}
			<AnimatePresence>
				{showFilters && filterContent && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="sm:hidden fixed inset-0 bg-overlay backdrop-blur-sm z-40"
							onClick={() => setShowFilters(false)}
						/>
						{/* Bottom Sheet */}
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							drag="y"
							dragConstraints={{ top: 0 }}
							dragElastic={{ top: 0, bottom: 0.5 }}
							onDragEnd={(_, info) => {
								if (info.offset.y > 100 || info.velocity.y > 500) {
									setShowFilters(false);
								}
							}}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl border-t border-border shadow-2xl max-h-[80vh] overflow-hidden">
							{/* Handle */}
							<div className="flex justify-center py-3">
								<div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
							</div>
							{/* Header */}
							<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
								<h3 className="text-base font-semibold text-foreground">Filters</h3>
								<div className="flex items-center gap-3">
									{hasActiveFilters && onClearFilters && (
										<button
											type="button"
											onClick={onClearFilters}
											className="text-sm text-muted-foreground hover:text-foreground transition-colors">
											Clear all
										</button>
									)}
									<button
										type="button"
										onClick={() => setShowFilters(false)}
										className="p-2 rounded-lg hover:bg-foreground/5 transition-colors">
										<X size={18} className="text-muted-foreground" />
									</button>
								</div>
							</div>
							{/* Content */}
							<div className="p-4 overflow-y-auto max-h-[60vh]">
								{filterContent}
							</div>
							{/* Apply Button */}
							<div className="p-4 border-t border-border">
								<button
									type="button"
									onClick={() => setShowFilters(false)}
									className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors">
									Apply Filters
								</button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

// Status tabs component for member lists
interface StatusTab {
	id: string;
	label: string;
	count?: number;
	icon?: React.ReactNode;
}

interface StatusTabsProps {
	tabs: StatusTab[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
}

export function StatusTabs({ tabs, activeTab, onTabChange }: StatusTabsProps) {
	return (
		<div className="flex gap-1 p-1 bg-surface rounded-xl border border-border overflow-x-auto scrollbar-none">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onTabChange(tab.id)}
					className={cn(
						"flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
						activeTab === tab.id
							? "bg-foreground/10 text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
					)}>
					{tab.icon}
					<span>{tab.label}</span>
					{tab.count !== undefined && (
						<span
							className={cn(
								"min-w-5 h-5 flex items-center justify-center text-xs rounded-full px-1.5",
								activeTab === tab.id ? "bg-foreground/10" : "bg-surface"
							)}>
							{tab.count}
						</span>
					)}
				</button>
			))}
		</div>
	);
}

export default ListToolbar;
