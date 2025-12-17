"use client";

import { ClubRegistrationDto, RegistrationStatus } from "@/lib/models/Club";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock, FileText, Users, XCircle } from "lucide-react";
import { FormAnswersView } from "../forms/FormAnswersView";
import { RegistrationStatusActions } from "./RegistrationStatusActions";

type Props = {
	registration: ClubRegistrationDto;
	onStatusChange: (status: RegistrationStatus, note?: string) => void;
	isUpdating: boolean;
};

const statusConfig: Record<RegistrationStatus, { label: string; icon: React.ReactNode; color: string }> = {
	[RegistrationStatus.Pending]: { label: "Pending", icon: <Clock size={16} />, color: "text-yellow-400 bg-yellow-400/10" },
	[RegistrationStatus.Waitlist]: { label: "Waitlist", icon: <Users size={16} />, color: "text-blue-400 bg-blue-400/10" },
	[RegistrationStatus.Accepted]: { label: "Accepted", icon: <CheckCircle size={16} />, color: "text-green-400 bg-green-400/10" },
	[RegistrationStatus.Declined]: { label: "Declined", icon: <XCircle size={16} />, color: "text-red-400 bg-red-400/10" },
};

export const RegistrationDetail = ({ registration, onStatusChange, isUpdating }: Props) => {
	const status = statusConfig[registration.status];

	return (
		<div className="flex flex-col gap-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-medium">
						{registration.userId.slice(0, 2).toUpperCase()}
					</div>
					<div>
						<h2 className="text-xl font-semibold text-white">User {registration.userId.slice(0, 8)}</h2>
						<p className="text-sm text-muted">Registration ID: {registration.id.slice(0, 8)}</p>
					</div>
				</div>
				<div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color}`}>
					{status.icon}
					<span className="font-medium">{status.label}</span>
				</div>
			</div>

			{/* Timeline */}
			<div className="p-4 bg-white/5 rounded-xl border border-white/10">
				<div className="flex items-center gap-3 text-sm">
					<Calendar size={16} className="text-muted" />
					<span className="text-muted">Submitted:</span>
					<span className="text-white">{format(new Date(registration.submittedAt), "PPP 'at' p")}</span>
				</div>
				{registration.statusChangedAt && (
					<div className="flex items-center gap-3 text-sm mt-2">
						<Clock size={16} className="text-muted" />
						<span className="text-muted">Status changed:</span>
						<span className="text-white">{format(new Date(registration.statusChangedAt), "PPP 'at' p")}</span>
					</div>
				)}
				{registration.statusNote && (
					<div className="flex items-start gap-3 text-sm mt-2">
						<FileText size={16} className="text-muted mt-0.5" />
						<span className="text-muted">Note:</span>
						<span className="text-white">{registration.statusNote}</span>
					</div>
				)}
			</div>

			{/* Form Answers */}
			{registration.formResponse && registration.formResponse.answers.length > 0 && (
				<div className="p-4 bg-white/5 rounded-xl border border-white/10">
					<h3 className="text-lg font-medium text-white mb-4">Form Responses</h3>
					<FormAnswersView answers={registration.formResponse.answers} />
				</div>
			)}

			{/* Actions */}
			{registration.status === RegistrationStatus.Pending || registration.status === RegistrationStatus.Waitlist ? (
				<RegistrationStatusActions currentStatus={registration.status} onStatusChange={onStatusChange} isUpdating={isUpdating} />
			) : null}
		</div>
	);
};
