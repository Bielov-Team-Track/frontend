"use client";

import { Button, Input, Select } from "@/components";
import Modal from "@/components/ui/modal";
import { CreateTeamRequest, SkillLevel, Team, UpdateTeamRequest } from "@/lib/models/Club";
import { useEffect, useState } from "react";

const SKILL_LEVEL_OPTIONS = Object.values(SkillLevel).map((level) => ({
	value: level,
	label: level,
}));

interface TeamFormModalProps {
	isOpen: boolean;
	team?: Team | null;
	clubId: string;
	onClose: () => void;
	onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => void;
	isLoading?: boolean;
}

export default function TeamFormModal({ isOpen, team, clubId, onClose, onSubmit, isLoading = false }: TeamFormModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [skillLevel, setSkillLevel] = useState<string>("");

	const isEditing = !!team;

	useEffect(() => {
		if (team) {
			setName(team.name);
			setDescription(team.description || "");
			setSkillLevel(team.skillLevel || "");
		} else {
			setName("");
			setDescription("");
			setSkillLevel("");
		}
	}, [team, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		if (isEditing) {
			onSubmit({
				name: name.trim(),
				description: description.trim() || undefined,
				skillLevel: skillLevel || undefined,
			} as UpdateTeamRequest);
		} else {
			onSubmit({
				clubId,
				name: name.trim(),
				description: description.trim() || undefined,
				skillLevel: skillLevel || undefined,
			} as CreateTeamRequest);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Team" : "Create Team"} size="md">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input label="Team Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter team name" required />

				<div>
					<label className="block text-sm font-medium text-white mb-2">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe your team"
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent resize-none"
					/>
				</div>

				<Select
					label="Skill Level"
					options={SKILL_LEVEL_OPTIONS}
					value={skillLevel}
					onChange={(value) => setSkillLevel(value || "")}
					placeholder="Select skill level"
					clearable
					fullWidth
				/>

				<div className="flex justify-end gap-3 pt-4">
					<Button type="button" variant="ghost" color="neutral" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default" color="accent" disabled={!name.trim()} loading={isLoading}>
						{isEditing ? "Save Changes" : "Create Team"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
