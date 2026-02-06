"use client";

import { AttendanceEvent, AttendanceMember, AttendanceRecord, AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { stringToColor } from "@/lib/utils/color";
import { AlertTriangle, Calendar, Check, ChevronRight, DollarSign, HelpCircle, MessageSquare, Minus, TrendingDown, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface MemberDetailModalProps {
	member: AttendanceMember;
	events: AttendanceEvent[];
	records: AttendanceRecord[];
	onClose: () => void;
}

const STATUS_CONFIG: Record<AttendanceStatus, { bg: string; textColor: string; icon: React.ReactNode; label: string }> = {
	[AttendanceStatus.Invited]: {
		bg: "bg-hover",
		textColor: "text-muted",
		icon: <HelpCircle size={14} />,
		label: "Invited",
	},
	[AttendanceStatus.Waitlisted]: {
		bg: "bg-amber-500/20",
		textColor: "text-amber-400",
		icon: <HelpCircle size={14} />,
		label: "Waitlisted",
	},
	[AttendanceStatus.Accepted]: {
		bg: "bg-info/20",
		textColor: "text-info",
		icon: <Check size={14} strokeWidth={3} />,
		label: "Accepted",
	},
	[AttendanceStatus.Declined]: {
		bg: "bg-error/20",
		textColor: "text-error",
		icon: <X size={14} strokeWidth={3} />,
		label: "Declined",
	},
	[AttendanceStatus.Attended]: {
		bg: "bg-success/20",
		textColor: "text-success",
		icon: <Check size={14} strokeWidth={3} />,
		label: "Attended",
	},
	[AttendanceStatus.NoShow]: {
		bg: "bg-warning/20",
		textColor: "text-warning",
		icon: <Minus size={14} strokeWidth={3} />,
		label: "No-show",
	},
};

export default function MemberDetailModal({ member, events, records, onClose }: MemberDetailModalProps) {
	const router = useRouter();
	const bgColor = stringToColor(member.name || member.userId);

	// Calculate stats
	const memberRecords = records.filter((r) => r.userId === member.userId);
	const stats = {
		total: events.length,
		attended: memberRecords.filter((r) => r.status === AttendanceStatus.Attended).length,
		accepted: memberRecords.filter((r) => r.status === AttendanceStatus.Accepted).length,
		declined: memberRecords.filter((r) => r.status === AttendanceStatus.Declined).length,
		noShow: memberRecords.filter((r) => r.status === AttendanceStatus.NoShow).length,
		invited: memberRecords.filter((r) => r.status === AttendanceStatus.Invited).length,
	};

	// Calculate participation rate (attended / total events with response)
	const respondedEvents = stats.attended + stats.declined + stats.noShow;
	const participationRate = respondedEvents > 0 ? Math.round((stats.attended / respondedEvents) * 100) : 0;

	// Payment stats
	const paidEvents = events.filter((e) => !e.isFree);
	const memberPaidRecords = memberRecords.filter((r) => {
		const event = events.find((e) => e.id === r.eventId);
		return event && !event.isFree;
	});
	const paidCount = memberPaidRecords.filter((r) => r.paymentStatus === PaymentStatus.Paid).length;
	const unpaidCount = memberPaidRecords.filter((r) => r.paymentStatus === PaymentStatus.Unpaid).length;

	// Get event details for each record
	const recordsWithEvents = memberRecords
		.map((record) => {
			const event = events.find((e) => e.id === record.eventId);
			return event ? { record, event } : null;
		})
		.filter((item): item is { record: AttendanceRecord; event: AttendanceEvent } => item !== null)
		.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm" onClick={onClose} />

			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200"
					onClick={(e) => e.stopPropagation()}>
					{/* Header */}
					<div className="flex items-center gap-4 p-4 border-b border-border">
						{/* Avatar */}
						<div
							className="w-14 h-14 rounded-lg flex items-center justify-center text-lg font-bold text-background-dark shrink-0"
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

						{/* Name and warning */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2">
								<h2 className="text-lg font-semibold text-foreground truncate">{member.name}</h2>
								{member.highlightWarning && (
									<span className="flex items-center gap-1 text-xs font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded">
										<AlertTriangle size={12} />
										{member.declineStreak} declines
									</span>
								)}
							</div>
							<p className="text-sm text-muted">
								{participationRate}% participation rate
								{participationRate >= 70 ? (
									<TrendingUp size={14} className="inline ml-1 text-success" />
								) : participationRate < 50 ? (
									<TrendingDown size={14} className="inline ml-1 text-error" />
								) : null}
							</p>
						</div>

						{/* Close button */}
						<button onClick={onClose} className="p-2 rounded-lg hover:bg-hover text-muted hover:text-foreground transition-colors">
							<X size={20} />
						</button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-4 gap-2 p-4 border-b border-border">
						<div className="text-center p-2 rounded-lg bg-success/10">
							<div className="text-xl font-bold text-success">{stats.attended}</div>
							<div className="text-xs text-muted">Attended</div>
						</div>
						<div className="text-center p-2 rounded-lg bg-info/10">
							<div className="text-xl font-bold text-info">{stats.accepted}</div>
							<div className="text-xs text-muted">Accepted</div>
						</div>
						<div className="text-center p-2 rounded-lg bg-error/10">
							<div className="text-xl font-bold text-error">{stats.declined}</div>
							<div className="text-xs text-muted">Declined</div>
						</div>
						<div className="text-center p-2 rounded-lg bg-warning/10">
							<div className="text-xl font-bold text-warning">{stats.noShow}</div>
							<div className="text-xs text-muted">No-show</div>
						</div>
					</div>

					{/* Payment summary (if applicable) */}
					{paidEvents.length > 0 && (
						<div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
							<div className="flex items-center gap-2 text-sm">
								<DollarSign size={16} className="text-muted" />
								<span className="text-muted">Payment Status</span>
							</div>
							<div className="flex items-center gap-3">
								<span className="text-sm">
									<span className="text-success font-medium">{paidCount}</span>
									<span className="text-muted"> paid</span>
								</span>
								<span className="text-foreground/20">|</span>
								<span className="text-sm">
									<span className="text-error font-medium">{unpaidCount}</span>
									<span className="text-muted"> unpaid</span>
								</span>
							</div>
						</div>
					)}

					{/* Event history */}
					<div className="p-4 overflow-y-auto max-h-[40vh]">
						<h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Event History</h3>
						<div className="space-y-2">
							{recordsWithEvents.length === 0 ? (
								<p className="text-sm text-muted text-center py-4">No attendance records</p>
							) : (
								recordsWithEvents.map(({ record, event }) => {
									const config = STATUS_CONFIG[record.status];
									const isPaidEvent = !event.isFree;
									const eventDate = new Date(event.date);
									const hasReason = record.declineNote && (record.status === AttendanceStatus.Declined || record.status === AttendanceStatus.NoShow);

									return (
										<button
											key={record.id}
											onClick={() => {
												onClose();
												router.push(`/dashboard/events/${event.id}`);
											}}
											className="w-full text-left flex flex-col gap-2 p-3 rounded-lg bg-surface hover:bg-hover transition-colors group">
											<div className="flex items-center gap-3">
												{/* Date */}
												<div className="flex flex-col items-center justify-center w-10 h-10 rounded bg-surface shrink-0">
													<span className="text-xs font-bold text-white leading-none">{eventDate.getDate()}</span>
													<span className="text-[10px] text-muted uppercase">
														{eventDate.toLocaleString("default", { month: "short" })}
													</span>
												</div>

												{/* Event info */}
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
														{event.name}
													</div>
												</div>

												{/* Status badge */}
												<div className={`flex items-center gap-1.5 px-2 py-1 rounded ${config.bg} ${config.textColor}`}>
													{config.icon}
													<span className="text-xs font-medium">{config.label}</span>
												</div>

												{/* Payment badge */}
												{isPaidEvent && record.paymentStatus !== null && (
													<div
														className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
															record.paymentStatus === PaymentStatus.Paid
																? "bg-success/20 text-success"
																: "bg-error/20 text-error"
														}`}>
														<DollarSign size={12} />
														{record.paymentStatus === PaymentStatus.Paid ? "Paid" : "Unpaid"}
													</div>
												)}

												{/* Chevron indicator */}
												<ChevronRight size={16} className="text-muted group-hover:text-foreground transition-colors shrink-0" />
											</div>

											{/* Decline/No-show reason */}
											{hasReason && (
												<div className="flex items-start gap-2 ml-[52px] pl-3 border-l-2 border-border">
													<MessageSquare size={12} className="text-muted shrink-0 mt-0.5" />
													<span className="text-xs text-muted italic">{record.declineNote}</span>
												</div>
											)}
										</button>
									);
								})
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
