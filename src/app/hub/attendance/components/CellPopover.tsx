"use client";

import { Button, Modal, Select } from "@/components/ui";
import { AttendanceEvent, AttendanceMember, AttendanceRecord, AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { stringToColor } from "@/lib/utils/color";
import { AlertTriangle, Calendar, Clock, DollarSign, Gift, X } from "lucide-react";
import { useState } from "react";

interface CellPopoverProps {
	record: AttendanceRecord | null;
	event: AttendanceEvent;
	member: AttendanceMember;
	onClose: () => void;
	onUpdate: (status: AttendanceStatus, note?: string, paymentStatus?: PaymentStatus) => void;
	requireDeclineReason?: boolean;
	isLoading?: boolean;
}

const STATUS_OPTIONS = [
	{ value: AttendanceStatus.Invited, label: "Invited" },
	{ value: AttendanceStatus.Accepted, label: "Accepted" },
	{ value: AttendanceStatus.Declined, label: "Declined" },
	{ value: AttendanceStatus.Attended, label: "Attended" },
	{ value: AttendanceStatus.NoShow, label: "No-show" },
];

export default function CellPopover({ record, event, member, onClose, onUpdate, requireDeclineReason = false, isLoading = false }: CellPopoverProps) {
	const [status, setStatus] = useState<AttendanceStatus>(record?.status ?? AttendanceStatus.Invited);
	const [declineNote, setDeclineNote] = useState(record?.declineNote || "");
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>(record?.paymentStatus ?? undefined);

	const showPayment = !event.isFree && (status === AttendanceStatus.Accepted || status === AttendanceStatus.Attended || status === AttendanceStatus.NoShow);

	const showDeclineNote = status === AttendanceStatus.Declined;
	const bgColor = stringToColor(member.name || member.userId);
	const eventDate = new Date(event.date);

	const handleSave = () => {
		if (showDeclineNote && requireDeclineReason && !declineNote.trim()) {
			return;
		}
		onUpdate(status, showDeclineNote ? declineNote : undefined, showPayment ? paymentStatus : undefined);
	};

	const canSave = !showDeclineNote || !requireDeclineReason || declineNote.trim().length > 0;

	return (
		<Modal isOpen={true} onClose={onClose} title="Update Attendance" isLoading={isLoading}>
			<div className="space-y-5">
				{/* Member info */}
				<div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border">
					<div
						className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-background-dark shrink-0"
						style={{ backgroundColor: bgColor }}>
						{member.avatarUrl ? (
							<img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-lg object-cover" />
						) : (
							member.name
								.split(" ")
								.map((n) => n[0])
								.join("")
								.toUpperCase()
								.slice(0, 2)
						)}
					</div>
					<div className="min-w-0 flex-1">
						<div className="font-medium text-white truncate">{member.name}</div>
						<div className="flex items-center gap-1.5 text-xs text-muted">
							<Calendar size={11} />
							<span>{event.name}</span>
							<span className="text-white/30">•</span>
							<span>{eventDate.toLocaleDateString()}</span>
						</div>
					</div>
					{member.highlightWarning && (
						<div className="flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 px-2 py-1 rounded">
							<AlertTriangle size={10} />
							{member.declineStreak}
						</div>
					)}
				</div>

				{/* Status select */}
				<Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(val) => setStatus(val as AttendanceStatus)} />

				{/* Existing Decline Reason (read-only display) */}
				{record?.status === AttendanceStatus.Declined && record?.declineNote && status !== AttendanceStatus.Declined && (
					<div className="p-3 rounded-lg bg-error/10 border border-error/20">
						<div className="flex items-center gap-2 text-sm font-medium text-error mb-1">
							<X size={14} />
							<span>Previous Decline Reason</span>
						</div>
						<p className="text-sm text-white/80">{record.declineNote}</p>
					</div>
				)}

				{/* Decline Note (editable) */}
				{showDeclineNote && (
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							Reason
							{requireDeclineReason && <span className="text-error ml-1">*</span>}
						</label>
						{record?.declineNote && record?.status === AttendanceStatus.Declined && (
							<p className="text-xs text-muted mb-2">Current reason: {record.declineNote}</p>
						)}
						<textarea
							value={declineNote}
							onChange={(e) => setDeclineNote(e.target.value)}
							placeholder="Why are they declining?"
							className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted focus:outline-hidden focus:border-primary/50 transition-colors resize-none"
							rows={2}
						/>
						{requireDeclineReason && !declineNote.trim() && <p className="text-xs text-error mt-1">Reason is required</p>}
					</div>
				)}

				{/* Payment Status */}
				{showPayment && (
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							<DollarSign size={14} className="inline mr-1" />
							Payment Status
						</label>
						<div className="flex gap-2">
							<Button
								variant={paymentStatus === PaymentStatus.Unpaid ? "destructive" : "ghost"}
								size="sm"
								onClick={() => setPaymentStatus(PaymentStatus.Unpaid)}>
								Unpaid
							</Button>
							<Button
								variant={paymentStatus === PaymentStatus.Paid ? "default" : "ghost"}
								size="sm"
								onClick={() => setPaymentStatus(PaymentStatus.Paid)}>
								Paid
							</Button>
						</div>
					</div>
				)}

				{/* Free event indicator */}
				{event.isFree && (
					<div className="flex items-center gap-2 text-xs text-success bg-success/10 px-3 py-2 rounded-lg">
						<Gift size={14} />
						<span>This is a free event - no payment required</span>
					</div>
				)}

				{/* Last updated info */}
				{record?.updatedAt && (
					<div className="flex items-center gap-2 text-xs text-muted">
						<Clock size={12} />
						<span>
							Updated {new Date(record.updatedAt).toLocaleString()}
							{record.updatedByUserName && <span className="text-white/50"> by {record.updatedByUserName}</span>}
						</span>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3 pt-2">
					<Button variant="ghost" color="neutral" className="flex-1" onClick={onClose}>
						Cancel
					</Button>
					<Button className="flex-1" onClick={handleSave} disabled={!canSave}>
						Save
					</Button>
				</div>
			</div>
		</Modal>
	);
}
