"use client";

import Link from "next/link";
import { Edit, Trash2, Users } from "lucide-react";
import { Team } from "@/lib/models/Club";

interface TeamCardProps {
	team: Team;
	onManage?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

export default function TeamCard({
	team,
	onManage,
	onEdit,
	onDelete,
}: TeamCardProps) {
	return (
		<Link
			href={`/dashboard/teams/${team.id}`}
			className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-accent/30 transition-colors group block">
			<div className="flex items-center gap-3 mb-3">
				<div className="w-12 h-12 rounded-lg bg-background-light flex items-center justify-center">
					{team.logoUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={team.logoUrl}
							alt=""
							className="w-full h-full object-cover rounded-lg"
						/>
					) : (
						<Users className="text-muted" size={20} />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-bold text-white truncate">{team.name}</h4>
					{team.skillLevel && (
						<span className="text-xs text-muted">{team.skillLevel}</span>
					)}
				</div>
				{(onEdit || onDelete) && (
					<div className="flex gap-1">
						{onEdit && (
							<button
								onClick={(e) => {
									e.preventDefault();
									onEdit();
								}}
								className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
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
								className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
								title="Delete team">
								<Trash2 size={14} />
							</button>
						)}
					</div>
				)}
			</div>
			{team.description && (
				<p className="text-sm text-muted line-clamp-2">{team.description}</p>
			)}
			<div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
				<span className="text-xs text-muted">
					{team.members?.length || 0} members
				</span>
				{onManage && (
					<button
						onClick={(e) => {
							e.preventDefault();
							onManage();
						}}
						className="text-xs text-accent hover:underline">
						Manage Members
					</button>
				)}
			</div>
		</Link>
	);
}
