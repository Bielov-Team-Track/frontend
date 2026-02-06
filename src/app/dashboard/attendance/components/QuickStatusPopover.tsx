"use client";

import { AttendanceEvent, AttendanceMember, AttendanceRecord, AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { Check, ChevronDown, DollarSign, HelpCircle, Loader2, MessageSquare, Minus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QuickStatusPopoverProps {
	record: AttendanceRecord | null;
	event: AttendanceEvent;
	member: AttendanceMember;
	onUpdate: (status: AttendanceStatus, note?: string, paymentStatus?: PaymentStatus) => void;
	onClose: () => void;
	isLoading?: boolean;
	anchorRect: DOMRect | null;
}

const STATUS_OPTIONS = [
	{
		status: AttendanceStatus.Invited,
		label: "Invited",
		shortcut: "1",
		icon: HelpCircle,
		bg: "bg-hover hover:bg-hover active:scale-95",
		activeBg: "bg-hover ring-2 ring-border",
		textColor: "text-muted",
	},
	{
		status: AttendanceStatus.Accepted,
		label: "Accepted",
		shortcut: "2",
		icon: Check,
		bg: "bg-info/20 hover:bg-info/30 active:scale-95",
		activeBg: "bg-info/40 ring-2 ring-info",
		textColor: "text-info",
	},
	{
		status: AttendanceStatus.Attended,
		label: "Attended",
		shortcut: "3",
		icon: Check,
		bg: "bg-success/20 hover:bg-success/30 active:scale-95",
		activeBg: "bg-success/40 ring-2 ring-success",
		textColor: "text-success",
	},
	{
		status: AttendanceStatus.Declined,
		label: "Declined",
		shortcut: "4",
		icon: X,
		bg: "bg-error/20 hover:bg-error/30 active:scale-95",
		activeBg: "bg-error/40 ring-2 ring-error",
		textColor: "text-error",
		needsReason: true,
	},
	{
		status: AttendanceStatus.NoShow,
		label: "No-show",
		shortcut: "5",
		icon: Minus,
		bg: "bg-warning/20 hover:bg-warning/30 active:scale-95",
		activeBg: "bg-warning/40 ring-2 ring-warning",
		textColor: "text-warning",
		needsReason: true,
	},
];

export default function QuickStatusPopover({
	record,
	event,
	member,
	onUpdate,
	onClose,
	isLoading = false,
	anchorRect,
}: QuickStatusPopoverProps) {
	const currentStatus = record?.status ?? AttendanceStatus.Invited;
	const currentPaymentStatus = record?.paymentStatus ?? undefined;
	const showPayment = !event.isFree;

	const [pendingStatus, setPendingStatus] = useState<AttendanceStatus | null>(null);
	const [reason, setReason] = useState(record?.declineNote || "");
	const [showNoteInput, setShowNoteInput] = useState(false);
	const [adminNote, setAdminNote] = useState("");

	const popoverRef = useRef<HTMLDivElement>(null);
	const reasonInputRef = useRef<HTMLInputElement>(null);

	// Status that needs reason
	const needsReason = pendingStatus === AttendanceStatus.Declined || pendingStatus === AttendanceStatus.NoShow;

	const handleStatusClick = (status: AttendanceStatus) => {
		const option = STATUS_OPTIONS.find(o => o.status === status);

		// If status needs reason, show reason input first
		if (option?.needsReason) {
			setPendingStatus(status);
			setTimeout(() => reasonInputRef.current?.focus(), 50);
			return;
		}

		// Otherwise, update immediately
		onUpdate(status, undefined, currentPaymentStatus);
	};

	const handleReasonSubmit = () => {
		if (pendingStatus) {
			onUpdate(pendingStatus, reason || undefined, currentPaymentStatus);
		}
	};

	const handlePaymentClick = (paymentStatus: PaymentStatus) => {
		onUpdate(currentStatus, undefined, paymentStatus);
	};

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't handle if typing in input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				if (e.key === "Enter" && pendingStatus) {
					e.preventDefault();
					handleReasonSubmit();
				}
				if (e.key === "Escape") {
					if (pendingStatus) {
						setPendingStatus(null);
						setReason("");
					} else {
						onClose();
					}
				}
				return;
			}

			// Number shortcuts for status
			const num = parseInt(e.key);
			if (num >= 1 && num <= 5) {
				e.preventDefault();
				const option = STATUS_OPTIONS[num - 1];
				handleStatusClick(option.status);
			}

			// P for paid, U for unpaid
			if (showPayment && e.key.toLowerCase() === "p") {
				e.preventDefault();
				handlePaymentClick(PaymentStatus.Paid);
			}
			if (showPayment && e.key.toLowerCase() === "u") {
				e.preventDefault();
				handlePaymentClick(PaymentStatus.Unpaid);
			}

			// Escape to close
			if (e.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [pendingStatus, reason, showPayment, currentStatus, currentPaymentStatus]);

	// Calculate position
	const getPosition = () => {
		if (!anchorRect) return { top: 0, left: 0 };

		const popoverWidth = 320;
		const padding = 8;

		let top = anchorRect.bottom + padding;
		let left = anchorRect.left + anchorRect.width / 2 - popoverWidth / 2;

		// Keep within viewport
		if (left < padding) left = padding;
		if (left + popoverWidth > window.innerWidth - padding) {
			left = window.innerWidth - popoverWidth - padding;
		}

		// On mobile, center and make full width
		if (window.innerWidth < 400) {
			left = padding;
		}

		return { top, left };
	};

	const position = getPosition();
	const isMobile = typeof window !== "undefined" && window.innerWidth < 400;

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-50 bg-overlay-light" onClick={onClose} />

			{/* Popover */}
			<div
				ref={popoverRef}
				className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-150"
				style={{
					top: position.top,
					left: position.left,
					width: isMobile ? `calc(100% - 16px)` : "320px",
				}}>
				<div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
					{/* Header - compact */}
					<div className="flex items-center gap-2 px-3 py-2 bg-surface-elevated border-b border-border">
						<span className="text-sm font-medium text-foreground truncate flex-1">{member.name}</span>
						<span className="text-xs text-muted truncate max-w-[120px]">{event.name}</span>
						{isLoading && <Loader2 size={14} className="animate-spin text-primary" />}
					</div>

					<div className="p-2">
						{/* Status buttons - icons with shortcuts */}
						{!pendingStatus ? (
							<div className="flex gap-1">
								{STATUS_OPTIONS.map((option) => {
									const Icon = option.icon;
									const isActive = currentStatus === option.status;

									return (
										<button
											key={option.status}
											onClick={() => handleStatusClick(option.status)}
											disabled={isLoading}
											className={`
												flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 rounded-lg
												transition-all duration-100 touch-manipulation
												${isActive ? option.activeBg : option.bg}
												${option.textColor}
												disabled:opacity-50 disabled:cursor-not-allowed
												min-h-[60px] sm:min-h-[52px]
											`}
											title={`${option.label} (${option.shortcut})`}>
											<Icon size={20} strokeWidth={isActive ? 3 : 2} />
											<span className="text-[10px] font-medium leading-tight hidden sm:block">{option.label}</span>
											<span className="text-[9px] opacity-50 font-mono">{option.shortcut}</span>
										</button>
									);
								})}
							</div>
						) : (
							/* Reason input for declined/no-show */
							<div className="space-y-2">
								<div className="flex items-center gap-2 text-sm">
									<span className={pendingStatus === AttendanceStatus.Declined ? "text-error" : "text-warning"}>
										{pendingStatus === AttendanceStatus.Declined ? "Declined" : "No-show"}
									</span>
									<span className="text-muted">— Add reason (optional)</span>
								</div>
								<input
									ref={reasonInputRef}
									type="text"
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="e.g., Sick, Family emergency..."
									className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-border"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleReasonSubmit();
										}
									}}
								/>
								<div className="flex gap-2">
									<button
										onClick={() => {
											setPendingStatus(null);
											setReason("");
										}}
										className="flex-1 py-2 rounded-lg bg-surface text-foreground/70 text-sm hover:bg-hover transition-colors">
										Cancel
									</button>
									<button
										onClick={handleReasonSubmit}
										disabled={isLoading}
										className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
											pendingStatus === AttendanceStatus.Declined
												? "bg-error text-white hover:bg-error/80"
												: "bg-warning text-black hover:bg-warning/80"
										}`}>
										{reason ? "Save with reason" : "Save without reason"}
									</button>
								</div>
							</div>
						)}

						{/* Payment toggle - only for paid events */}
						{showPayment && !pendingStatus && (
							<div className="flex gap-1.5 mt-2 pt-2 border-t border-border">
								<button
									onClick={() => handlePaymentClick(PaymentStatus.Unpaid)}
									disabled={isLoading}
									className={`
										flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium
										transition-all duration-100 touch-manipulation
										${currentPaymentStatus === PaymentStatus.Unpaid
											? "bg-error/30 text-error ring-2 ring-error"
											: "bg-error/10 text-error/70 hover:bg-error/20"
										}
										disabled:opacity-50
									`}>
									<DollarSign size={14} />
									<span>Unpaid</span>
									<span className="text-[9px] opacity-50 font-mono ml-1">U</span>
								</button>
								<button
									onClick={() => handlePaymentClick(PaymentStatus.Paid)}
									disabled={isLoading}
									className={`
										flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium
										transition-all duration-100 touch-manipulation
										${currentPaymentStatus === PaymentStatus.Paid
											? "bg-success/30 text-success ring-2 ring-success"
											: "bg-success/10 text-success/70 hover:bg-success/20"
										}
										disabled:opacity-50
									`}>
									<DollarSign size={14} />
									<span>Paid</span>
									<span className="text-[9px] opacity-50 font-mono ml-1">P</span>
								</button>
							</div>
						)}

						{/* Admin note toggle */}
						{!pendingStatus && (
							<div className="mt-2 pt-2 border-t border-border">
								{!showNoteInput ? (
									<button
										onClick={() => setShowNoteInput(true)}
										className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors w-full justify-center py-1">
										<MessageSquare size={12} />
										<span>Add admin note</span>
										<ChevronDown size={12} />
									</button>
								) : (
									<div className="space-y-2">
										<input
											type="text"
											value={adminNote}
											onChange={(e) => setAdminNote(e.target.value)}
											placeholder="Internal note..."
											className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-border"
											autoFocus
										/>
										<div className="flex gap-2">
											<button
												onClick={() => {
													setShowNoteInput(false);
													setAdminNote("");
												}}
												className="flex-1 py-1.5 rounded-lg bg-surface text-foreground/70 text-xs hover:bg-hover">
												Cancel
											</button>
											<button
												onClick={() => {
													// Save admin note with current status
													onUpdate(currentStatus, adminNote || undefined, currentPaymentStatus);
												}}
												className="flex-1 py-1.5 rounded-lg bg-primary text-foreground text-xs hover:bg-primary/80">
												Save note
											</button>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Existing reason display */}
						{record?.declineNote && !pendingStatus && !showNoteInput && (
							<div className="mt-2 pt-2 border-t border-border">
								<div className="text-xs text-muted">
									<span className="text-error">Reason:</span> {record.declineNote}
								</div>
							</div>
						)}
					</div>

					{/* Keyboard hints - desktop only */}
					<div className="hidden sm:flex items-center justify-center gap-3 px-3 py-1.5 bg-surface border-t border-border text-[10px] text-muted">
						<span>1-5 Status</span>
						{showPayment && <span>P/U Payment</span>}
						<span>Esc Close</span>
					</div>
				</div>
			</div>
		</>
	);
}
