"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import { SkillLevel, Team, UpdateTeamRequest } from "@/lib/models/Club";

interface TeamSettingsFormProps {
	team: Team;
	onSubmit: (data: UpdateTeamRequest) => void;
	isLoading?: boolean;
}

export default function TeamSettingsForm({
	team,
	onSubmit,
	isLoading = false,
}: TeamSettingsFormProps) {
	const [name, setName] = useState(team.name);
	const [description, setDescription] = useState(team.description || "");
	const [skillLevel, setSkillLevel] = useState<string>(team.skillLevel || "");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		onSubmit({
			name: name.trim(),
			description: description.trim() || undefined,
			skillLevel: skillLevel || undefined,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Team Name
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent resize-none"
						/>
					</div>
				</div>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Skill Level
						</label>
						<select
							value={skillLevel}
							onChange={(e) => setSkillLevel(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent">
							<option value="">Select skill level</option>
							{Object.values(SkillLevel).map((level) => (
								<option key={level} value={level}>
									{level}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>
			<div className="flex justify-end pt-4 border-t border-white/10">
				<Button
					type="submit"
					variant="solid"
					color="accent"
					loading={isLoading}>
					Save Changes
				</Button>
			</div>
		</form>
	);
}
