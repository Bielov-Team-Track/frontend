"use client";

import { Select } from "@/components";
import { DropdownOption } from "@/components/ui/dropdown";
import { SelectOption } from "@/components/ui/select/index";
import { getClubs } from "@/lib/api/clubs";
import { loadGroups } from "@/lib/api/groups";
import { Club } from "@/lib/models/Club";
import { useQuery } from "@tanstack/react-query";
import { Building2, Shield, User, Users, UsersRound } from "lucide-react";

interface AttendanceFiltersProps {
	clubId: string | null;
	organizerId: string | null;
	groupId: string | null;
	teamId: string | null;
	onClubChange: (clubId: string | null) => void;
	onOrganizerChange: (organizerId: string | null) => void;
	onGroupChange: (groupId: string | null) => void;
	onTeamChange: (teamId: string | null) => void;
}

export default function AttendanceFilters({
	clubId,
	organizerId,
	groupId,
	teamId,
	onClubChange,
	onOrganizerChange,
	onGroupChange,
	onTeamChange,
}: AttendanceFiltersProps) {
	const { data: clubs = [] } = useQuery({
		queryKey: ["clubs"],
		queryFn: getClubs,
	});

	const { data: groups = [] } = useQuery({
		queryKey: ["groups"],
		queryFn: loadGroups,
	});

	// Client-side filter for groups if clubId is selected and group has clubId
	const relevantGroups = clubId ? groups.filter((g: any) => !g.clubId || g.clubId === clubId) : groups;

	const clubOptions: SelectOption[] = [
		{ value: "", label: "All Clubs" },
		...clubs.map((club: Club) => ({
			value: club.id,
			label: club.name,
			data: club,
		})),
	];

	const groupOptions: SelectOption[] = [
		{ value: "", label: "All Groups" },
		...relevantGroups.map((group) => ({
			value: group.id || "",
			label: group.name,
			data: group,
		})),
	];

	const organizerOptions: SelectOption[] = [{ value: "", label: "All Organizers" }];
	const teamOptions: SelectOption[] = [{ value: "", label: "All Teams" }];

	// Renderers
	const renderClubOption = (option: DropdownOption<Club>) => {
		if (!option.value) return <span className="text-white/70">{option.label}</span>;
		return (
			<div className="flex items-center gap-2.5">
				{option.data?.logoUrl ? (
					<img src={option.data.logoUrl} alt="" className="w-5 h-5 rounded-full object-cover bg-white/5" />
				) : (
					<div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
						<Building2 size={12} className="text-muted" />
					</div>
				)}
				<span className="truncate">{option.label}</span>
			</div>
		);
	};

	const renderGroupOption = (option: DropdownOption<any>) => {
		if (!option.value) return <span className="text-white/70">{option.label}</span>;
		const color = option.data?.color || "#6b7280";
		return (
			<div className="flex items-center gap-2.5">
				<div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
				<span className="truncate">{option.label}</span>
			</div>
		);
	};

	const renderUserOption = (option: DropdownOption<any>, icon: React.ReactNode) => {
		if (!option.value) return <span className="text-white/70">{option.label}</span>;
		return (
			<div className="flex items-center gap-2.5">
				<div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">{icon}</div>
				<span className="truncate">{option.label}</span>
			</div>
		);
	};

	return (
		<div className="flex flex-wrap items-end gap-3 w-full">
			{/* Club Filter */}
			<div className="w-full sm:w-50 flex-1 min-w-40">
				<Select
					label="Club"
					options={clubOptions}
					value={clubId || ""}
					onChange={(val) => onClubChange(val ? String(val) : null)}
					leftIcon={<Shield size={14} />}
					renderOption={renderClubOption}
					renderValue={renderClubOption}
				/>
			</div>

			{/* Organizer Filter */}
			<div className="w-full sm:w-50 flex-1 min-w-40">
				<Select
					label="Organizer"
					options={organizerOptions}
					value={organizerId || ""}
					onChange={(val) => onOrganizerChange(val ? String(val) : null)}
					leftIcon={<User size={14} />}
					renderOption={(opt) => renderUserOption(opt, <User size={12} className="text-muted" />)}
					renderValue={(opt) => renderUserOption(opt, <User size={12} className="text-muted" />)}
				/>
			</div>

			{/* Group Filter */}
			<div className="w-full sm:w-50 flex-1 min-w-40">
				<Select
					label="Group"
					options={groupOptions}
					value={groupId || ""}
					onChange={(val) => onGroupChange(val ? String(val) : null)}
					leftIcon={<Users size={14} />}
					disabled={!clubId}
					renderOption={renderGroupOption}
					renderValue={renderGroupOption}
				/>
			</div>

			{/* Team Filter */}
			<div className="w-full sm:w-50 flex-1 min-w-40">
				<Select
					label="Team"
					options={teamOptions}
					value={teamId || ""}
					onChange={(val) => onTeamChange(val ? String(val) : null)}
					leftIcon={<UsersRound size={14} />}
					renderOption={(opt) => renderUserOption(opt, <UsersRound size={12} className="text-muted" />)}
					renderValue={(opt) => renderUserOption(opt, <UsersRound size={12} className="text-muted" />)}
				/>
			</div>
		</div>
	);
}
