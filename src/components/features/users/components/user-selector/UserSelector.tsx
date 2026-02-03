"use client";

import { Avatar, Button, Checkbox, EmptyState, Input, Select } from "@/components";
import { renderClubOption, renderGroupOption, renderTeamOption } from "@/components/features/clubs/utils";
import Skeleton, { SkeletonAvatar } from "@/components/ui/skeleton";
import { searchClubMembers } from "@/lib/api/clubs/members";
import { searchUsers } from "@/lib/api/user";
import { Club, Group, Team } from "@/lib/models/Club";
import { SortDirection } from "@/lib/models/Pagination";
import { UserProfile } from "@/lib/models/User";
import { useClub } from "@/providers";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Filter, Loader2, RotateCcw, Search, UserCheck, UserPlus, X } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export interface UserSelectorProps {
	/** Pre-fetched users to display (if provided, disables internal fetching) */
	users?: UserProfile[];
	/** Currently selected users */
	selectedUsers?: UserProfile[];
	/** Callback when selection changes */
	onChange?: (users: UserProfile[]) => void;
	/** Callback when a single user is selected/deselected */
	onSelect?: (user: UserProfile, selected: boolean) => void;
	/** Whether to show club/group/team filters */
	showFilters?: boolean;
	/** Whether to show the action button */
	showButton?: boolean;
	/** Label for the action button */
	buttonLabel?: string;
	/** Callback when action button is clicked */
	onButtonClick?: (selectedUsers: UserProfile[]) => void;
	/** Default context for filtering */
	defaultContext?: Club | Group | Team | undefined;
	/** Whether component is disabled */
	disabled?: boolean;
	/** Placeholder text for search */
	searchPlaceholder?: string;
	/** Empty state title when no users found */
	emptyTitle?: string;
	/** Empty state description when no users found */
	emptyDescription?: string;
	/** User IDs to exclude from the list (e.g., existing members) */
	excludeUserIds?: string[];
	/** Restrict selection to members of a specific club (locks club filter) */
	restrictToClub?: Club;
}

function MemberSkeleton() {
	return (
		<div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
			<SkeletonAvatar className="bg-neutral-800" size="sm" />
			<div className="flex-1 space-y-1.5">
				<Skeleton className="bg-neutral-800" height="0.875rem" width="60%" rounded="md" />
				<Skeleton className="bg-neutral-800" height="0.75rem" width="40%" rounded="md" />
			</div>
		</div>
	);
}

export default function UserSelector({
	users: externalUsers,
	selectedUsers: externalSelectedUsers,
	onChange,
	onSelect,
	showFilters = true,
	showButton = false,
	buttonLabel = "Confirm Selection",
	onButtonClick,
	defaultContext,
	disabled = false,
	searchPlaceholder = "Search people by name or email...",
	emptyTitle,
	emptyDescription,
	excludeUserIds,
	restrictToClub,
}: UserSelectorProps) {
	// Search states
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [sidebarSearch, setSidebarSearch] = useState<string>("");

	// Filter states (single select instead of multi)
	// If restrictToClub is provided, use its ID as the initial and locked value
	const [selectedClubId, setSelectedClubId] = useState<string>(restrictToClub?.id || "");
	const [selectedGroupId, setSelectedGroupId] = useState<string>("");
	const [selectedTeamId, setSelectedTeamId] = useState<string>("");

	// Whether club filter is locked (restricted to a specific club)
	const isClubLocked = !!restrictToClub;

	// Sync selectedClubId when restrictToClub changes
	useEffect(() => {
		if (restrictToClub) {
			setSelectedClubId(restrictToClub.id);
		}
	}, [restrictToClub]);

	// Mobile sheet state
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

	// Track if component is mounted (for portal rendering)
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
		return () => setIsMounted(false);
	}, []);

	// Internal selected users state (used when no external control)
	const [internalSelectedUsers, setInternalSelectedUsers] = useState<UserProfile[]>([]);

	// Select all loading state
	const [isSelectingAll, setIsSelectingAll] = useState(false);

	// Create a Set for efficient exclusion lookup
	const excludeUserIdSet = useMemo(() => new Set(excludeUserIds || []), [excludeUserIds]);

	// Debounced search using useDeferredValue for smoother UX
	const deferredSearchQuery = useDeferredValue(searchQuery);
	const isSearching = searchQuery !== deferredSearchQuery;

	const clubs = useClub().clubs;

	// Determine if component is controlled
	const isControlled = externalSelectedUsers !== undefined;
	const selectedUsers = isControlled ? externalSelectedUsers : internalSelectedUsers;

	const clubOptions = useMemo(
		() =>
			clubs.map((club) => ({
				value: club.id,
				label: club.name,
				data: club,
			})),
		[clubs],
	);

	// Get selected club (use restrictToClub if provided, otherwise find from clubs list)
	const selectedClub = useMemo(() => {
		if (restrictToClub) return restrictToClub;
		return clubs.find((c) => c.id === selectedClubId);
	}, [clubs, selectedClubId, restrictToClub]);

	// Groups from selected club
	const groupOptions = useMemo(() => {
		if (!selectedClub?.groups) return [];
		return selectedClub.groups.map((group: Group) => ({
			value: group.id,
			label: group.name,
			data: group,
		}));
	}, [selectedClub]);

	// Teams from selected club
	const teamOptions = useMemo(() => {
		if (!selectedClub?.teams) return [];
		return selectedClub.teams.map((team: Team) => ({
			value: team.id,
			label: team.name,
			data: team,
		}));
	}, [selectedClub]);

	// Fetch users from Profiles service (when no club selected and no external users)
	const {
		data: usersResult,
		isLoading: isLoadingUsers,
		isFetching: isFetchingUsers,
	} = useQuery({
		queryKey: ["users-search", deferredSearchQuery],
		queryFn: () =>
			searchUsers({
				query: deferredSearchQuery || undefined,
				limit: 50,
				sortBy: "name",
				sortDirection: SortDirection.Ascending,
			}),
		enabled: !externalUsers && !selectedClubId,
		staleTime: 5000,
	});

	// Fetch members from Club service (when club selected and no external users)
	const membersQueries = useQueries({
		queries:
			selectedClubId && !externalUsers
				? [
						{
							queryKey: ["club-members-search", selectedClubId, deferredSearchQuery, selectedGroupId || null, selectedTeamId || null],
							queryFn: () =>
								searchClubMembers(selectedClubId, {
									query: deferredSearchQuery || undefined,
									limit: 50,
									groupId: selectedGroupId || undefined,
									teamId: selectedTeamId || undefined,
									sortBy: "name",
									sortDirection: SortDirection.Ascending,
								}),
							staleTime: 5000,
						},
					]
				: [],
	});

	const isLoadingMembers = membersQueries.some((q) => q.isLoading);
	const isFetchingMembers = membersQueries.some((q) => q.isFetching);

	// Track pagination info for "select all" functionality
	const paginationInfo = useMemo(() => {
		if (externalUsers) {
			return { hasMore: false, totalCount: externalUsers.length };
		}
		if (selectedClubId) {
			const firstQuery = membersQueries[0];
			return {
				hasMore: firstQuery?.data?.hasMore ?? false,
				totalCount: firstQuery?.data?.totalCount,
			};
		}
		return {
			hasMore: usersResult?.hasMore ?? false,
			totalCount: usersResult?.totalCount,
		};
	}, [externalUsers, selectedClubId, membersQueries, usersResult]);

	// Normalize data to UserProfile[] and filter out excluded users
	const displayUsers: UserProfile[] = useMemo(() => {
		let users: UserProfile[] = [];

		// If external users provided, filter them locally
		if (externalUsers) {
			if (!deferredSearchQuery) {
				users = externalUsers;
			} else {
				const query = deferredSearchQuery.toLowerCase();
				users = externalUsers.filter((user) => {
					const fullName = `${user.name || ""} ${user.surname || ""}`.toLowerCase();
					const email = (user.email || "").toLowerCase();
					return fullName.includes(query) || email.includes(query);
				});
			}
		} else if (selectedClubId) {
			const userMap = new Map<string, UserProfile>();
			membersQueries.forEach((query) => {
				(query.data?.items || []).forEach((member) => {
					if (member.userProfile) {
						userMap.set(member.userProfile.userId, member.userProfile);
					}
				});
			});
			users = Array.from(userMap.values());
		} else {
			users = usersResult?.items || [];
		}

		// Filter out excluded users
		if (excludeUserIdSet.size > 0) {
			users = users.filter((user) => !excludeUserIdSet.has(user.id));
		}

		return users;
	}, [externalUsers, selectedClubId, membersQueries, usersResult, deferredSearchQuery, excludeUserIdSet]);

	// Filter selected users by sidebar search
	const filteredSelectedUsers = useMemo(() => {
		if (!sidebarSearch) return selectedUsers;
		const query = sidebarSearch.toLowerCase();
		return selectedUsers.filter((user) => {
			const fullName = `${user.name || ""} ${user.surname || ""}`.toLowerCase();
			const email = (user.email || "").toLowerCase();
			return fullName.includes(query) || email.includes(query);
		});
	}, [selectedUsers, sidebarSearch]);

	const isLoading = externalUsers ? false : selectedClubId ? isLoadingMembers : isLoadingUsers;
	const isFetching = externalUsers ? false : selectedClubId ? isFetchingMembers : isFetchingUsers;

	// Filter state helpers
	// When club is locked, don't count it as an "active filter" since it's the baseline
	const hasActiveFilters = showFilters && ((!isClubLocked && !!selectedClubId) || !!selectedGroupId || !!selectedTeamId || !!searchQuery);

	const clearAllFilters = useCallback(() => {
		setSearchQuery("");
		// Don't clear club if it's locked
		if (!isClubLocked) {
			setSelectedClubId("");
		}
		setSelectedGroupId("");
		setSelectedTeamId("");
	}, [isClubLocked]);

	// Update selected users
	const updateSelectedUsers = useCallback(
		(newSelectedUsers: UserProfile[]) => {
			if (isControlled) {
				onChange?.(newSelectedUsers);
			} else {
				setInternalSelectedUsers(newSelectedUsers);
			}
		},
		[isControlled, onChange],
	);

	// Handle user selection toggle
	const handleUserToggle = useCallback(
		(user: UserProfile) => {
			if (disabled) return;

			const isSelected = selectedUsers.some((u) => u.id === user.id);

			if (isSelected) {
				updateSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
			} else {
				updateSelectedUsers([...selectedUsers, user]);
			}

			onSelect?.(user, !isSelected);
		},
		[selectedUsers, updateSelectedUsers, onSelect, disabled],
	);

	// Check if a user is selected
	const isUserSelected = useCallback((userId: string) => selectedUsers.some((u) => u.id === userId), [selectedUsers]);

	// Select all visible users (and fetch remaining pages if hasMore)
	const handleSelectAll = useCallback(async () => {
		if (disabled || isSelectingAll) return;

		// If there are more pages, fetch them all
		if (paginationInfo.hasMore && !externalUsers) {
			setIsSelectingAll(true);
			try {
				const allUsers: UserProfile[] = [...displayUsers];
				let cursor = selectedClubId ? membersQueries[0]?.data?.nextCursor : usersResult?.nextCursor;

				// Fetch all remaining pages
				while (cursor) {
					let result;
					if (selectedClubId) {
						result = await searchClubMembers(selectedClubId, {
							query: deferredSearchQuery || undefined,
							limit: 100, // Larger batch for efficiency
							groupId: selectedGroupId || undefined,
							teamId: selectedTeamId || undefined,
							sortBy: "name",
							sortDirection: SortDirection.Ascending,
							cursor,
						});
						// Extract user profiles from members
						result.items.forEach((member) => {
							if (member.userProfile && !excludeUserIdSet.has(member.userProfile.id)) {
								allUsers.push(member.userProfile);
							}
						});
					} else {
						result = await searchUsers({
							query: deferredSearchQuery || undefined,
							limit: 100,
							sortBy: "name",
							sortDirection: SortDirection.Ascending,
							cursor,
						});
						// Filter out excluded users
						result.items.forEach((user) => {
							if (!excludeUserIdSet.has(user.id)) {
								allUsers.push(user);
							}
						});
					}
					cursor = result.hasMore ? result.nextCursor : undefined;
				}

				// Deduplicate and merge with existing selection
				const newSelectedUsers = [...selectedUsers];
				const existingIds = new Set(selectedUsers.map((u) => u.id));
				allUsers.forEach((user) => {
					if (!existingIds.has(user.id)) {
						newSelectedUsers.push(user);
						onSelect?.(user, true);
					}
				});
				updateSelectedUsers(newSelectedUsers);
			} finally {
				setIsSelectingAll(false);
			}
		} else {
			// No more pages, just select visible users
			const newSelectedUsers = [...selectedUsers];
			displayUsers.forEach((user) => {
				if (!newSelectedUsers.some((u) => u.id === user.id)) {
					newSelectedUsers.push(user);
					onSelect?.(user, true);
				}
			});
			updateSelectedUsers(newSelectedUsers);
		}
	}, [
		selectedUsers,
		displayUsers,
		updateSelectedUsers,
		onSelect,
		disabled,
		isSelectingAll,
		paginationInfo.hasMore,
		externalUsers,
		selectedClubId,
		membersQueries,
		usersResult,
		deferredSearchQuery,
		selectedGroupId,
		selectedTeamId,
		excludeUserIdSet,
	]);

	// Deselect all filtered visible users
	const handleDeselectAllFiltered = useCallback(() => {
		if (disabled) return;

		const filteredIds = new Set(displayUsers.map((u) => u.id));
		const deselectedUsers = selectedUsers.filter((u) => filteredIds.has(u.id));
		const newSelectedUsers = selectedUsers.filter((u) => !filteredIds.has(u.id));

		deselectedUsers.forEach((user) => onSelect?.(user, false));
		updateSelectedUsers(newSelectedUsers);
	}, [selectedUsers, displayUsers, updateSelectedUsers, onSelect, disabled]);

	// Remove a single user from selection
	const handleRemoveUser = useCallback(
		(user: UserProfile) => {
			if (disabled) return;

			updateSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
			onSelect?.(user, false);
		},
		[selectedUsers, updateSelectedUsers, onSelect, disabled],
	);

	// Clear all selected users
	const handleClearAllSelected = useCallback(() => {
		if (disabled) return;

		selectedUsers.forEach((user) => onSelect?.(user, false));
		updateSelectedUsers([]);
	}, [selectedUsers, updateSelectedUsers, onSelect, disabled]);

	const allVisibleSelected = displayUsers.length > 0 && displayUsers.every((u) => isUserSelected(u.id));
	const someVisibleSelected = displayUsers.some((u) => isUserSelected(u.id));

	// Shared Selected Panel Content
	const SelectedPanelContent = ({ isMobile = false }: { isMobile?: boolean }) => (
		<>
			<div className="flex items-center justify-between mb-3 shrink-0">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
						<UserCheck size={16} className="text-accent" />
					</div>
					<span className="text-sm font-semibold text-white">Selected ({selectedUsers.length})</span>
				</div>
				<div className="flex items-center gap-2">
					{selectedUsers.length > 0 && (
						<button
							type="button"
							onClick={handleClearAllSelected}
							disabled={disabled}
							className="text-xs text-muted hover:text-red-400 transition-colors disabled:opacity-50">
							Clear
						</button>
					)}
					{isMobile && (
						<button
							type="button"
							onClick={() => setMobileSheetOpen(false)}
							className="p-1 ml-2 rounded-md text-muted hover:text-white hover:bg-white/10 transition-colors">
							<X size={20} />
						</button>
					)}
				</div>
			</div>

			{/* Sidebar Search */}
			{selectedUsers.length > 3 && (
				<div className="relative mb-3 shrink-0">
					<Input
						placeholder="Search selected..."
						leftIcon={<Search size={14} />}
						value={sidebarSearch}
						onChange={(e) => setSidebarSearch(e.target.value)}
						className="text-xs"
						disabled={disabled}
					/>
					{sidebarSearch && (
						<button
							type="button"
							onClick={() => setSidebarSearch("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
							<X size={12} />
						</button>
					)}
				</div>
			)}

			{/* Search results info */}
			{sidebarSearch && filteredSelectedUsers.length !== selectedUsers.length && (
				<p className="text-xs text-muted mb-2 shrink-0">
					Showing {filteredSelectedUsers.length} of {selectedUsers.length}
				</p>
			)}

			<div className={`flex-1 min-h-0 overflow-y-auto space-y-2 ${isMobile ? "max-h-[40vh]" : ""}`}>
				{selectedUsers.length === 0 ? (
					<div className="py-8 text-center">
						<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
							<UserPlus size={24} className="text-muted" />
						</div>
						<p className="text-muted text-sm">No one selected yet</p>
						<p className="text-muted/60 text-xs mt-1">Select people from the list</p>
					</div>
				) : filteredSelectedUsers.length === 0 && sidebarSearch ? (
					<div className="py-6 text-center text-muted text-xs">No selected people match "{sidebarSearch}"</div>
				) : (
					filteredSelectedUsers.map((user) => {
						const displayName = `${user.name || ""} ${user.surname || ""}`.trim() || "Unknown User";
						return (
							<div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 group">
								<Avatar name={displayName} src={user.imageUrl} variant="user" size="xs" />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-white truncate">{displayName}</p>
								</div>
								<button
									type="button"
									onClick={() => handleRemoveUser(user)}
									disabled={disabled}
									className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-red-400/10 disabled:opacity-50">
									<X size={16} />
								</button>
							</div>
						);
					})
				)}
			</div>

			{showButton && (
				<div className="pt-4 border-t border-white/10 mt-4 shrink-0">
					<Button
						onClick={() => onButtonClick?.(selectedUsers)}
						disabled={selectedUsers.length === 0 || disabled}
						className="w-full"
						variant="default">
						{selectedUsers.length === 0 ? "Select people first" : buttonLabel}
					</Button>
				</div>
			)}
		</>
	);

	return (
		<div className="border border-white/10 rounded-xl overflow-hidden bg-neutral-950 relative h-[520px] flex flex-col">
			{/* Desktop Layout */}
			<div className="flex flex-1 min-h-0 h-full">
				{/* Main content */}
				<div className="flex-1 lg:w-[calc(100%-300px)] p-4 pb-20 lg:pb-4 flex flex-col min-h-0 overflow-hidden">
					{/* Search Input */}
					<div className="relative shrink-0">
						<Input
							placeholder={searchPlaceholder}
							leftIcon={<Search size={16} />}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							disabled={disabled}
						/>
						{searchQuery && !isSearching && !isFetching && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors">
								<X size={16} />
							</button>
						)}
						{(isSearching || isFetching) && (
							<div className="absolute right-3 top-1/2 -translate-y-1/2">
								<Loader2 size={16} className="animate-spin text-muted" />
							</div>
						)}
					</div>

					{/* Filters Row */}
					{showFilters && (
						<div className="mt-4 space-y-3 shrink-0">
							<div className="flex items-center gap-1.5 text-muted">
								<Filter size={14} />
								<span className="text-xs font-medium">Filter by:</span>
								{hasActiveFilters && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearAllFilters}
										leftIcon={<RotateCcw size={14} />}
										disabled={disabled}
										className="text-muted hover:text-white ml-auto">
										Clear all
									</Button>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<Select
									options={clubOptions}
									placeholder={isClubLocked ? restrictToClub?.name : "All clubs"}
									value={selectedClubId}
									onChange={(value) => {
										if (isClubLocked) return; // Don't allow changes when locked
										setSelectedClubId(value || "");
										setSelectedGroupId("");
										setSelectedTeamId("");
									}}
									clearable={!isClubLocked}
									disabled={disabled || isClubLocked}
									renderOption={renderClubOption}
								/>

								<Select
									options={teamOptions}
									placeholder={!selectedClubId ? "Select club first" : teamOptions.length === 0 ? "No teams" : "All teams"}
									value={selectedTeamId}
									onChange={(value) => setSelectedTeamId(value || "")}
									clearable
									disabled={disabled || !selectedClubId || teamOptions.length === 0}
									renderOption={renderTeamOption}
								/>

								<Select
									options={groupOptions}
									placeholder={!selectedClubId ? "Select club first" : groupOptions.length === 0 ? "No groups" : "All groups"}
									value={selectedGroupId}
									onChange={(value) => setSelectedGroupId(value || "")}
									clearable
									disabled={disabled || !selectedClubId || groupOptions.length === 0}
									renderOption={renderGroupOption}
								/>
							</div>
						</div>
					)}

					{/* Select All Bar */}
					{!isLoading && displayUsers.length > 0 && (
						<div className="mt-4 shrink-0 flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/5">
							<div className="flex items-center gap-3">
								<Checkbox
									checked={allVisibleSelected}
									indeterminate={someVisibleSelected && !allVisibleSelected}
									onChange={() => (allVisibleSelected ? handleDeselectAllFiltered() : handleSelectAll())}
									disabled={disabled || isSelectingAll}
								/>
								<span className="text-sm text-muted">
									{isSelectingAll ? (
										<span className="flex items-center gap-2 text-accent">
											<Loader2 size={14} className="animate-spin" />
											Selecting all...
										</span>
									) : allVisibleSelected ? (
										<span className="text-accent">All {displayUsers.length} selected</span>
									) : someVisibleSelected ? (
										<>
											<span className="text-white">{displayUsers.filter((u) => isUserSelected(u.id)).length}</span>
											<span className="text-muted/60"> of </span>
											<span className="text-white">{displayUsers.length}</span>
											<span className="text-muted/60 hidden sm:inline"> selected</span>
										</>
									) : (
										<span className="hidden sm:inline">
											{displayUsers.length} {displayUsers.length === 1 ? "person" : "people"} in list
											{paginationInfo.hasMore && paginationInfo.totalCount && (
												<span className="text-muted/60"> ({paginationInfo.totalCount} total)</span>
											)}
										</span>
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								{isSelectingAll ? (
									<span className="text-xs text-muted">Please wait...</span>
								) : (
									<>
										{someVisibleSelected && !allVisibleSelected && (
											<button
												type="button"
												onClick={handleSelectAll}
												disabled={disabled || isSelectingAll}
												className="text-xs text-accent hover:text-accent/80 transition-colors disabled:opacity-50">
												Select all{paginationInfo.hasMore && paginationInfo.totalCount ? ` ${paginationInfo.totalCount}` : ""}
											</button>
										)}
										{someVisibleSelected && (
											<button
												type="button"
												onClick={handleDeselectAllFiltered}
												disabled={disabled || isSelectingAll}
												className="text-xs text-muted hover:text-red-400 transition-colors disabled:opacity-50">
												Deselect
											</button>
										)}
										{!someVisibleSelected && displayUsers.length > 0 && (
											<button
												type="button"
												onClick={handleSelectAll}
												disabled={disabled || isSelectingAll}
												className="text-xs px-2 py-1 bg-accent/10 text-accent hover:bg-accent/20 rounded transition-colors disabled:opacity-50">
												Select all
												{paginationInfo.hasMore && paginationInfo.totalCount
													? ` ${paginationInfo.totalCount}`
													: ` ${displayUsers.length}`}
											</button>
										)}
									</>
								)}
							</div>
						</div>
					)}

					{/* Results List */}
					{isLoading ? (
						<div className="mt-4 flex-1 min-h-0 overflow-y-auto space-y-2">
							{[...Array(5)].map((_, i) => (
								<MemberSkeleton key={i} />
							))}
						</div>
					) : displayUsers.length === 0 ? (
						<div className="mt-4 flex-1 min-h-0 overflow-y-auto">
							<EmptyState
								icon={hasActiveFilters ? Search : UserPlus}
								title={emptyTitle || (hasActiveFilters ? "No matching people" : "No people found")}
								description={
									emptyDescription ||
									(hasActiveFilters
										? "No people match your current filters. Try adjusting or clearing filters."
										: "Start typing to search for people.")
								}
								action={
									hasActiveFilters
										? {
												label: "Clear all filters",
												onClick: clearAllFilters,
												icon: RotateCcw,
											}
										: undefined
								}
								className="py-12"
							/>
						</div>
					) : (
						<div className="mt-4 flex-1 min-h-0 overflow-y-auto space-y-1 pr-2">
							{displayUsers.map((user) => {
								const isSelected = isUserSelected(user.id);
								const displayName = `${user.name || ""} ${user.surname || ""}`.trim() || "Unknown User";

								return (
									<button
										type="button"
										key={user.id}
										onClick={() => handleUserToggle(user)}
										disabled={disabled}
										className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
											isSelected ? "bg-accent/10" : "hover:bg-white/5 border-l-2 border-transparent"
										}`}>
										<Checkbox checked={isSelected} onChange={() => {}} tabIndex={-1} disabled={disabled} />
										<Avatar name={displayName} src={user.imageUrl} variant="user" size="sm" />
										<div className="flex-1 min-w-0">
											<p className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-white/90"}`}>{displayName}</p>
											{user.email && <p className="text-xs text-muted truncate">{user.email}</p>}
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Desktop Sidebar - Always visible */}
				<div className="hidden lg:flex w-75 bg-linear-to-l from-white/5 to-transparent border-l border-white/10 overflow-hidden">
					<div className="p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
						<SelectedPanelContent />
					</div>
				</div>
			</div>

			{/* Mobile Bottom Bar - Stays within modal */}
			<div className="lg:hidden absolute bottom-0 left-0 right-0 border-t border-white/10 bg-neutral-950">
				<button
					type="button"
					onClick={() => setMobileSheetOpen(true)}
					className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
					<div className="flex items-center gap-3">
						{/* Avatar Stack */}
						<div className="flex -space-x-2">
							{selectedUsers.slice(0, 3).map((user) => {
								const displayName = `${user.name || ""} ${user.surname || ""}`.trim() || "Unknown";
								return <Avatar key={user.id} name={displayName} src={user.imageUrl} variant="user" size="xs" />;
							})}
							{selectedUsers.length === 0 && (
								<div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
									<UserPlus size={16} className="text-muted" />
								</div>
							)}
							{selectedUsers.length > 3 && (
								<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-medium border-2 border-neutral-900">
									+{selectedUsers.length - 3}
								</div>
							)}
						</div>
						<div className="text-left">
							<p className="text-sm font-medium text-white">
								{selectedUsers.length === 0 ? "No one selected" : `${selectedUsers.length} selected`}
							</p>
							<p className="text-xs text-muted">Tap to view & manage</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{selectedUsers.length > 0 && (
							<span className="px-2.5 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full">{selectedUsers.length}</span>
						)}
						<svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
						</svg>
					</div>
				</button>
			</div>

			{/* Mobile Bottom Sheet - Rendered via portal to appear from screen bottom */}
			{mobileSheetOpen &&
				isMounted &&
				createPortal(
					<div className="lg:hidden fixed inset-0 z-[100]">
						{/* Backdrop */}
						<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSheetOpen(false)} />
						{/* Sheet */}
						<div className="absolute bottom-0 left-0 right-0 bg-neutral-900 rounded-t-2xl border-t border-white/10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
							{/* Handle */}
							<div className="flex justify-center py-3">
								<div className="w-10 h-1 rounded-full bg-white/20" />
							</div>
							{/* Content */}
							<div className="px-4 pb-8 flex flex-col flex-1 overflow-hidden">
								<SelectedPanelContent isMobile />
							</div>
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
}
