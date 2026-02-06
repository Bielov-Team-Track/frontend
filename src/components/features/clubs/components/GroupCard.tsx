"use client";

import { Avatar } from "@/components/ui";
import { Group } from "@/lib/models/Club";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface GroupCardProps {
	group: Group;
	onEdit?: () => void;
	onDelete?: () => void;
}

export default function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
	const groupColor = group.color || "#6B7280";

	return (
		<Link
			href={`/dashboard/groups/${group.id}`}
			className="rounded-xl bg-surface border border-border p-4 hover:border-accent/30 transition-colors group block">
			<div className="flex items-center gap-3 mb-3">
				<Avatar size={"md"} variant="group" color={groupColor} />
				<div className="flex-1 min-w-0">
					<h4 className="font-bold text-foreground truncate">{group.name}</h4>
					{group.skillLevel && <span className="text-xs text-muted-foreground">{group.skillLevel}</span>}
				</div>
				{(onEdit || onDelete) && (
					<div className="flex gap-1">
						{onEdit && (
							<button
								onClick={(e) => {
									e.preventDefault();
									onEdit();
								}}
								className="p-1.5 rounded-lg hover:bg-hover text-muted-foreground hover:text-foreground transition-colors"
								title="Edit group">
								<Edit size={14} />
							</button>
						)}
						{onDelete && (
							<button
								onClick={(e) => {
									e.preventDefault();
									onDelete();
								}}
								className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
								title="Delete group">
								<Trash2 size={14} />
							</button>
						)}
					</div>
				)}
			</div>
			{group.description && <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>}
			<div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full" style={{ backgroundColor: groupColor }} />
					<span className="text-xs text-muted-foreground">{group.members?.length || 0} members</span>
				</div>
			</div>
		</Link>
	);
}
