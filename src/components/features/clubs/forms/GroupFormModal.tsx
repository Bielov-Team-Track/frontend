"use client";

import { Button, Input } from "@/components";
import Modal from "@/components/ui/modal";
import { CreateGroupRequest, Group, SkillLevel, UpdateGroupRequest } from "@/lib/models/Club";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

const GROUP_COLORS = [
	"#FF6B6B",
	"#4ECDC4",
	"#45B7D1",
	"#96CEB4",
	"#FFEAA7",
	"#DDA0DD",
	"#98D8C8",
	"#F7DC6F",
	"#BB8FCE",
	"#85C1E9",
	"#F1948A",
	"#82E0AA",
	"#F8C471",
	"#AED6F1",
	"#D7BDE2",
];

interface GroupFormModalProps {
	isOpen: boolean;
	group?: Group | null;
	clubId: string;
	onClose: () => void;
	onSubmit: (data: CreateGroupRequest | UpdateGroupRequest) => void;
	isLoading?: boolean;
}

export default function GroupFormModal({ isOpen, group, clubId, onClose, onSubmit, isLoading = false }: GroupFormModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [color, setColor] = useState(GROUP_COLORS[0]);
	const [skillLevel, setSkillLevel] = useState<string>("");

	const isEditing = !!group;

	useEffect(() => {
		if (group) {
			setName(group.name);
			setDescription(group.description || "");
			setColor(group.color || GROUP_COLORS[0]);
			setSkillLevel(group.skillLevel || "");
		} else {
			setName("");
			setDescription("");
			setColor(GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)]);
			setSkillLevel("");
		}
	}, [group, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		if (isEditing) {
			onSubmit({
				name: name.trim(),
				description: description.trim() || undefined,
				color,
				skillLevel: skillLevel || undefined,
			} as UpdateGroupRequest);
		} else {
			onSubmit({
				clubId,
				name: name.trim(),
				description: description.trim() || undefined,
				color,
				skillLevel: skillLevel || undefined,
			} as CreateGroupRequest);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Group" : "Create Group"} size="md">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input label="Group Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter group name" required />

				<div>
					<label className="block text-sm font-medium text-white mb-2">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe your group"
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent resize-none"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-white mb-2">Group Color</label>
					<div className="flex flex-wrap gap-2">
						{GROUP_COLORS.map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => setColor(c)}
								className={`w-8 h-8 rounded-lg transition-all ${
									color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#1e1e1e] scale-110" : "hover:scale-105"
								}`}
								style={{ backgroundColor: c }}>
								{color === c && <Check size={16} className="text-white mx-auto" />}
							</button>
						))}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-white mb-2">Skill Level</label>
					<select
						value={skillLevel}
						onChange={(e) => setSkillLevel(e.target.value)}
						className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-hidden focus:border-accent">
						<option value="">Select skill level (optional)</option>
						{Object.values(SkillLevel).map((level) => (
							<option key={level} value={level}>
								{level}
							</option>
						))}
					</select>
				</div>

				<div className="flex gap-3 pt-4">
					<Button type="button" variant="ghost" color="neutral" fullWidth onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default" color="accent" fullWidth disabled={!name.trim()} loading={isLoading}>
						{isEditing ? "Save Changes" : "Create Group"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
