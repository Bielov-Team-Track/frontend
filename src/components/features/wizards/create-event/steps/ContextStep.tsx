"use client";

import { Select } from "@/components/ui/select";
import { getGroupsByClub, getTeamsByClub, getUserClubs } from "@/lib/api/clubs";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users } from "lucide-react";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { WizardStepProps } from "../../core/types";
import { EventFormData } from "../types";

export function ContextStep({ form, context }: WizardStepProps<EventFormData>) {
	const { control, watch, setValue } = form;
	const { user } = useAuth();
	const selectedClubId = watch("clubId");

	// Fetch user's clubs
	const { data: clubs = [] } = useQuery({
		queryKey: ["user-clubs", user?.userId],
		queryFn: () => getUserClubs(user!.userId!),
		enabled: !!user?.userId,
	});

	// Fetch teams when club is selected
	const { data: teams = [] } = useQuery({
		queryKey: ["club-teams", selectedClubId],
		queryFn: () => getTeamsByClub(selectedClubId!),
		enabled: !!selectedClubId,
	});

	// Fetch groups when club is selected
	const { data: groups = [] } = useQuery({
		queryKey: ["club-groups", selectedClubId],
		queryFn: () => getGroupsByClub(selectedClubId!),
		enabled: !!selectedClubId,
	});

	// Reset team/group when club changes
	useEffect(() => {
		setValue("teamId", undefined);
		setValue("groupId", undefined);
	}, [selectedClubId, setValue]);

	const clubOptions = [{ value: "", label: "No club (personal event)" }, ...clubs.map((club) => ({ value: club.id, label: club.name }))];

	const teamOptions = [{ value: "", label: "No team" }, ...teams.map((team) => ({ value: team.id, label: team.name }))];

	const groupOptions = [{ value: "", label: "No group" }, ...groups.map((group) => ({ value: group.id, label: group.name }))];

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Event Context</h2>
				<p className="text-muted-foreground text-sm">Choose where this event belongs. Leave empty for a personal event.</p>
			</div>

			<div className="space-y-4">
				<Controller
					name="clubId"
					control={control}
					render={({ field }) => (
						<Select
							label="Club"
							options={clubOptions}
							value={field.value || ""}
							onChange={field.onChange}
							icon={<Building2 size={16} />}
							optional
						/>
					)}
				/>

				{selectedClubId && teams.length > 0 && (
					<Controller
						name="teamId"
						control={control}
						render={({ field }) => (
							<Select
								label="Team"
								options={teamOptions}
								value={field.value || ""}
								onChange={field.onChange}
								icon={<Users size={16} />}
								optional
							/>
						)}
					/>
				)}

				{selectedClubId && groups.length > 0 && (
					<Controller
						name="groupId"
						control={control}
						render={({ field }) => (
							<Select
								label="Group"
								options={groupOptions}
								value={field.value || ""}
								onChange={field.onChange}
								icon={<Users size={16} />}
								optional
							/>
						)}
					/>
				)}
			</div>
		</div>
	);
}
