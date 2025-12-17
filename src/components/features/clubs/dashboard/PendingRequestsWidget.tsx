"use client";

import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";

type Props = {
	clubSlug: string;
	pendingCount: number;
};

export const PendingRequestsWidget = ({ clubSlug, pendingCount }: Props) => {
	if (pendingCount === 0) return null;

	return (
		<Link
			href={`/clubs/${clubSlug}/requests`}
			className="flex items-center justify-between p-4 bg-accent/10 border border-accent/20 rounded-xl hover:bg-accent/20 transition-colors group">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
					<Users size={20} />
				</div>
				<div>
					<p className="font-medium text-white">
						+{pendingCount} new {pendingCount === 1 ? "request" : "requests"}
					</p>
					<p className="text-sm text-muted">Pending review</p>
				</div>
			</div>
			<div className="flex items-center gap-1 text-accent">
				<span className="text-sm">View</span>
				<ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
			</div>
		</Link>
	);
};
