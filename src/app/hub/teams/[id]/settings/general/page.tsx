"use client";

import { SettingsAlert, SettingsCard, SettingsHeader } from "@/components/layout/settings-layout";
import { Input, Select, TextArea } from "@/components/ui";
import { updateTeam } from "@/lib/api/clubs";
import { SkillLevel, UpdateTeamRequest } from "@/lib/models/Club";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTeamContext } from "../../layout";

interface FormValues {
	name: string;
	description: string;
	skillLevel: string;
}

const skillLevelOptions = [
	{ value: "", label: "Select skill level" },
	...Object.values(SkillLevel).map((level) => ({ value: level, label: level })),
];

export default function TeamGeneralSettingsPage() {
	const { team } = useTeamContext();
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
					{...register("skillLevel")}
					label="Skill Level"
					options={skillLevelOptions}
				/>
			</SettingsCard>
		</form>
	);
}
