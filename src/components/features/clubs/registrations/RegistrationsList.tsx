"use client";

import { Dropdown, Input, Spinner } from "@/components/ui";
import { ClubRegistration, RegistrationStatus } from "@/lib/models/Club";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, Clock, Filter, Search, Users, XCircle } from "lucide-react";
import { useState } from "react";

type Props = {
	registrations: ClubRegistration[];
	isLoading: boolean;
	onViewDetails: (registration: ClubRegistration) => void;
};

const statusConfig: Record<RegistrationStatus, { label: string; icon: React.ReactNode; color: string }> = {
	[RegistrationStatus.Pending]: { label: "Pending", icon: <Clock size={14} />, color: "text-yellow-400" },
	[RegistrationStatus.Waitlist]: { label: "Waitlist", icon: <Users size={14} />, color: "text-blue-400" },
	[RegistrationStatus.Accepted]: { label: "Accepted", icon: <CheckCircle size={14} />, color: "text-green-400" },
	[RegistrationStatus.Declined]: { label: "Declined", icon: <XCircle size={14} />, color: "text-red-400" },
};

export const RegistrationsList = ({ registrations, isLoading, onViewDetails }: Props) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("newest");

	const statusOptions = [
		{ value: "all", label: "All Statuses" },
		{ value: RegistrationStatus.Pending.toString(), label: "Pending" },
		{ value: RegistrationStatus.Waitlist.toString(), label: "Waitlist" },
		{ value: RegistrationStatus.Accepted.toString(), label: "Accepted" },
		{ value: RegistrationStatus.Declined.toString(), label: "Declined" },
	];

	const sortOptions = [
		{ value: "newest", label: "Newest First" },
		{ value: "oldest", label: "Oldest First" },
	];

	const filteredRegistrations = registrations
		.filter((r) => statusFilter === "all" || r.status.toString() === statusFilter)
		.sort((a, b) => {
			const dateA = new Date(a.submittedAt).getTime();
			const dateB = new Date(b.submittedAt).getTime();
			return sortBy === "newest" ? dateB - dateA : dateA - dateB;
		});

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner size="lg" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="flex-1">
					<Input placeholder="Search by user..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} leftIcon={<Search size={16} />} />
				</div>
				<div className="flex gap-3">
					<Dropdown options={statusOptions} value={statusFilter} onChange={(val) => setStatusFilter(val as string)} leftIcon={<Filter size={16} />} />
					<Dropdown options={sortOptions} value={sortBy} onChange={(val) => setSortBy(val as string)} />
				</div>
			</div>

			{filteredRegistrations.length === 0 ? (
				<div className="text-center py-12 text-muted">
					<Users size={48} className="mx-auto mb-4 opacity-50" />
					<p>No registration requests found</p>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{filteredRegistrations.map((registration) => {
						const status = statusConfig[registration.status];
						return (
							<div
								key={registration.id}
								className="p-4 bg-surface rounded-xl border border-border hover:bg-hover transition-colors cursor-pointer"
								onClick={() => onViewDetails(registration)}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
											{registration.userId.slice(0, 2).toUpperCase()}
										</div>
										<div>
											<p className="font-medium text-white">User {registration.userId.slice(0, 8)}</p>
											<p className="text-xs text-muted">
												Submitted {formatDistanceToNow(new Date(registration.submittedAt), { addSuffix: true })}
											</p>
										</div>
									</div>
									<div className={`flex items-center gap-1.5 ${status.color}`}>
										{status.icon}
										<span className="text-sm">{status.label}</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
