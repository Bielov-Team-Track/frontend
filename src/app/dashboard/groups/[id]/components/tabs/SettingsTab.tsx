"use client";

import { Button, ColorPicker, DEFAULT_PRESET_COLORS, Input, Select, TextArea } from "@/components";
import { deleteGroup, updateGroup } from "@/lib/api/clubs";
import { Group, SkillLevel, UpdateGroupRequest } from "@/lib/models/Club";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SettingsTabProps {
	group: Group;
	clubId: string;
}

export default function SettingsTab({ group, clubId }: SettingsTabProps) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const updateMutation = useMutation({
		mutationFn: (data: UpdateGroupRequest) => updateGroup(group.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", group.id] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteGroup(group.id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["club-groups", clubId],
			});
			router.push(`/dashboard/clubs/${clubId}`);
		},
	});

	return (
		<div className="space-y-8">
			{/* General Settings */}
			<div className="space-y-6">
				<h3 className="text-lg font-bold text-white">Group Settings</h3>
				<GroupSettingsForm group={group} onSubmit={(data) => updateMutation.mutate(data)} isLoading={updateMutation.isPending} />
			</div>

			{/* Danger Zone */}
			<div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
				<h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
				<p className="text-muted text-sm mb-4">Once you delete a group, there is no going back. Please be certain.</p>
				<Button
					variant="destructive"
					onClick={() => {
						if (confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
							deleteMutation.mutate();
						}
					}}
					disabled={deleteMutation.isPending}>
					{deleteMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "Delete Group"}
				</Button>
			</div>
		</div>
	);
}

function GroupSettingsForm({ group, onSubmit, isLoading }: { group: Group; onSubmit: (data: UpdateGroupRequest) => void; isLoading: boolean }) {
	const [name, setName] = useState(group.name);
	const [description, setDescription] = useState(group.description || "");
	const [color, setColor] = useState(group.color);
	const [skillLevel, setSkillLevel] = useState<string>(group.skillLevel || "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		onSubmit({
			name: name.trim(),
			description: description.trim() || undefined,
			color,
			skillLevel: skillLevel || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<Input type="text" value={name} label="Group Name" onChange={(e) => setName(e.target.value)} />
					<TextArea
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent resize-none"
					/>
				</div>
				<div className="space-y-4">
					<Select
						label="Skill Level"
						value={skillLevel}
						options={Object.values(SkillLevel).map((level) => ({ label: level, value: level }))}
						onChange={(value) => setSkillLevel(value!)}
					/>

					<ColorPicker label="Color Theme" value={color} onChange={setColor} presetColors={DEFAULT_PRESET_COLORS} />
				</div>
			</div>
			<div className="flex justify-end pt-4 border-t border-white/10">
				<Button type="submit" disabled={isLoading} leftIcon={<Save size={16} />}>
					Save changes
				</Button>
			</div>
		</form>
	);
}
