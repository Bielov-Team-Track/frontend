"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { SkillLevel, Team, CreateTeamRequest, UpdateTeamRequest } from "@/lib/models/Club";

interface TeamFormModalProps {
	isOpen: boolean;
	team?: Team | null;
	clubId: string;
	onClose: () => void;
	onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => void;
	isLoading?: boolean;
}

export default function TeamFormModal({
	isOpen,
	team,
	clubId,
	onClose,
	onSubmit,
	isLoading = false,
}: TeamFormModalProps) {
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
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isEditing ? "Edit Team" : "Create Team"}
			size="md">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Team Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Enter team name"
					required
				/>

				<div>
					<label className="block text-sm font-medium text-white mb-2">
						Description
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe your team"
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-white mb-2">
						Skill Level
					</label>
					<select
						value={skillLevel}
						onChange={(e) => setSkillLevel(e.target.value)}
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent">
						<option value="">Select skill level</option>
						{Object.values(SkillLevel).map((level) => (
							<option key={level} value={level}>
								{level}
							</option>
						))}
					</select>
				</div>

				<div className="flex gap-3 pt-4">
					<Button
						type="button"
						variant="ghost"
						color="neutral"
						fullWidth
						onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="solid"
						color="accent"
						fullWidth
						disabled={!name.trim()}
						loading={isLoading}>
						{isEditing ? "Save Changes" : "Create Team"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
