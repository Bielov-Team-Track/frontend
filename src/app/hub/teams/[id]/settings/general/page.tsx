"use client";

import { SettingsAlert, SettingsCard, SettingsHeader } from "@/components/layout/settings-layout";
import { Input, Select, TextArea } from "@/components/ui";
import { updateTeam } from "@/lib/api/clubs";
import { SkillLevel, UpdateTeamRequest, Visibility } from "@/lib/models/Club";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTeamContext } from "../../layout";

type VisibilityOption = "default" | "Public" | "Private";

interface FormValues {
	name: string;
	description: string;
	skillLevel: string;
	visibilityOption: VisibilityOption;
}

const skillLevelOptions = [
	{ value: "", label: "Select skill level" },
	...Object.values(SkillLevel).map((level) => ({ value: level, label: level })),
];

export default function TeamGeneralSettingsPage() {
	const { team, permissions } = useTeamContext();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<FormValues>({
		values: team
			? {
					name: team.name,
					description: team.description || "",
					skillLevel: team.skillLevel || "",
					visibilityOption: team.visibility ? (team.visibility as VisibilityOption) : "default",
			  }
			: undefined,
	});

	const updateMutation = useMutation({
		mutationFn: (data: FormValues) => {
			const request: UpdateTeamRequest = {
				name: data.name.trim(),
				description: data.description.trim() || undefined,
				skillLevel: data.skillLevel || undefined,
			};
			if (permissions.canChangeVisibility) {
				if (data.visibilityOption === "default") {
					request.resetVisibilityToDefault = true;
				} else {
					request.visibility = data.visibilityOption as Visibility;
				}
			}
			return updateTeam(team!.id, request);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["team", team!.id] });
		},
	});

	const getAlertStatus = () => {
		if (updateMutation.isSuccess) return "success" as const;
		if (updateMutation.isError) return "error" as const;
		return "idle" as const;
	};

	if (!team) return null;

	return (
		<form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
			<SettingsHeader
				title="General Settings"
				isDirty={isDirty}
				onSave={handleSubmit((data) => updateMutation.mutate(data))}
				isLoading={updateMutation.isPending}
			/>

			<SettingsAlert status={getAlertStatus()} />

			<SettingsCard title="Basic Information">
				<Input
					{...register("name", { required: "Team name is required" })}
					label="Team Name"
					required
					error={errors.name?.message}
				/>
				<TextArea
					{...register("description")}
					label="Description"
					rows={3}
					placeholder="Tell people about this team..."
				/>
			</SettingsCard>

			<SettingsCard title="Team Level">
				<Select
					{...(register("skillLevel") as any)}
					label="Skill Level"
					options={skillLevelOptions}
				/>
			</SettingsCard>

			{permissions.canChangeVisibility && (
				<SettingsCard title="Visibility">
					<p className="text-sm text-muted mb-3">Control who can see this team within the club.</p>
					<select
						{...register("visibilityOption")}
						className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground focus:outline-hidden focus:border-accent">
						<option value="default">Use club default</option>
						<option value="Public">Public — visible to all club members</option>
						<option value="Private">Private — visible to team members only</option>
					</select>
				</SettingsCard>
			)}
		</form>
	);
}
