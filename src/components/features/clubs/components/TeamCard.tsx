"use client";

import { Team } from "@/lib/models/Club";
import { Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";

interface TeamCardProps {
	team: Team;
	onEdit?: () => void;
	onDelete?: () => void;
}

export default function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
	return (
		<Link
			href={`/dashboard/teams/${team.id}`}
			className="rounded-xl bg-surface border border-border p-4 hover:border-accent/30 transition-colors group block">
			<div className="flex items-center gap-3 mb-3">
				<div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center">
					{team.logoUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={team.logoUrl} alt="" className="w-full h-full object-cover rounded-lg" />
					) : (
						<Users className="text-muted-foreground" size={20} />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-bold text-foreground truncate">{team.name}</h4>
					{team.skillLevel && <span className="text-xs text-muted-foreground">{team.skillLevel}</span>}
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
								title="Edit team">
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
								title="Delete team">
								<Trash2 size={14} />
							</button>
						)}
					</div>
				)}
			</div>
			{team.description && <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>}
			<div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
				<span className="text-xs text-muted-foreground">{team.members?.length || 0} members</span>
			</div>
		</Link>
	);
}
