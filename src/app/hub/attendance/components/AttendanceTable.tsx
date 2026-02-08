"use client";

import { AttendanceEvent, AttendanceMatrix, AttendanceMember, AttendanceRecord, AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { stringToColor } from "@/lib/utils/color";
import { AlertTriangle, Check, CheckSquare, HelpCircle, Minus, Square, User, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import AttendanceCell from "./AttendanceCell";
import QuickStatusPopover from "./QuickStatusPopover";
import BulkActionBar from "./BulkActionBar";
import MemberDetailModal from "./MemberDetailModal";

interface AttendanceTableProps {
	data: AttendanceMatrix;
	onUpdateAttendance: (eventId: string, userId: string, status: AttendanceStatus, note?: string, paymentStatus?: PaymentStatus) => void;
	isUpdating?: boolean;
}

export default function AttendanceTable({ data, onUpdateAttendance, isUpdating = false }: AttendanceTableProps) {
	const [selectedCell, setSelectedCell] = useState<{
		event: AttendanceEvent;
		member: AttendanceMember;
		anchorRect: DOMRect | null;
	} | null>(null);

	// Bulk mode state
	const [isBulkMode, setIsBulkMode] = useState(false);
	const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

	// Member detail modal state
	const [selectedMember, setSelectedMember] = useState<AttendanceMember | null>(null);

	// Build a lookup map for quick record access
	const recordMap = useMemo(() => {
		const map = new Map<string, AttendanceRecord>();
		data.records.forEach((record) => {
			map.set(`${record.eventId}-${record.userId}`, record);
		});
		return map;
	}, [data.records]);

	const getRecord = (eventId: string, userId: string) => {
		return recordMap.get(`${eventId}-${userId}`) || null;
	};

	// Use a delimiter that won't appear in UUIDs
	const CELL_KEY_DELIMITER = "::";

	const handleCellClick = (event: AttendanceEvent, member: AttendanceMember, buttonElement: HTMLButtonElement) => {
		if (isBulkMode) {
			// Toggle selection in bulk mode
			const key = `${event.id}${CELL_KEY_DELIMITER}${member.userId}`;
			setSelectedCells((prev) => {
				const next = new Set(prev);
				if (next.has(key)) {
					next.delete(key);
				} else {
					next.add(key);
				}
				return next;
			});
		} else {
			// Normal mode - show popover
			const rect = buttonElement.getBoundingClientRect();
			setSelectedCell({ event, member, anchorRect: rect });
		}
	};

	const handleBulkUpdate = (status: AttendanceStatus, paymentStatus?: PaymentStatus) => {
		// Apply status to all selected cells
		selectedCells.forEach((key) => {
			const [eventId, userId] = key.split(CELL_KEY_DELIMITER);
			onUpdateAttendance(eventId, userId, status, undefined, paymentStatus);
		});
		// Clear selection after bulk update
		setSelectedCells(new Set());
	};

	const toggleBulkMode = () => {
		setIsBulkMode((prev) => !prev);
		if (isBulkMode) {
			// Clear selection when exiting bulk mode
			setSelectedCells(new Set());
		}
	};

	const selectAll = () => {
		const allKeys = new Set<string>();
		data.events.forEach((event) => {
			data.members.forEach((member) => {
				allKeys.add(`${event.id}${CELL_KEY_DELIMITER}${member.userId}`);
			});
		});
		setSelectedCells(allKeys);
	};

	const clearSelection = () => {
		setSelectedCells(new Set());
	};

	const handleUpdate = (status: AttendanceStatus, note?: string, paymentStatus?: PaymentStatus) => {
		if (selectedCell) {
			onUpdateAttendance(selectedCell.event.id, selectedCell.member.userId, status, note, paymentStatus);
			setSelectedCell(null);
		}
	};

	if (data.members.length === 0 || data.events.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-24 text-center">
				<div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
					<Users size={28} className="text-muted" />
				</div>
				<p className="text-lg font-medium text-white mb-1">No attendance data</p>
				<p className="text-sm text-muted max-w-sm">No events or members found for the selected filters. Try adjusting your date range or filters.</p>
			</div>
		);
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="border-collapse table-fixed">
					{/* Header */}
					<thead>
						<tr>
							{/* Member column header */}
							<th className="sticky left-0 z-20 bg-background px-3 py-2 text-left w-[200px]">
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1.5 text-xs font-semibold text-muted uppercase tracking-wider flex-1">
										<User size={14} />
										Member
									</div>
									{/* Bulk mode toggle */}
									<button
										onClick={toggleBulkMode}
										className={`
											flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
											transition-all duration-150
											${isBulkMode
												? "bg-primary text-white"
												: "bg-surface text-muted hover:bg-hover hover:text-white"
											}
										`}
										title={isBulkMode ? "Exit bulk mode" : "Enter bulk mode"}
									>
										{isBulkMode ? <CheckSquare size={12} /> : <Square size={12} />}
										<span className="hidden sm:inline">Bulk</span>
									</button>
								</div>
							</th>
							{/* Event column headers */}
							{data.events.map((event) => {
								const date = new Date(event.date);
								const day = date.getDate();
								const month = date.toLocaleString("default", { month: "short" });
								const weekday = date.toLocaleString("default", { weekday: "short" });

								return (
									<th key={event.id} className="px-2 py-2 text-center w-[72px] border-l border-border" title={event.name}>
										<div className="flex flex-col items-center gap-1">
											<div className="flex flex-col items-center justify-center w-10 h-10 rounded-md bg-surface border border-border">
												<span className="text-sm font-bold text-white leading-none">{day}</span>
												<span className="text-xs font-semibold text-muted uppercase">{month}</span>
											</div>
											<span className="text-xs text-white/60 font-medium truncate max-w-[60px]">
												{event.name}
											</span>
										</div>
									</th>
								);
							})}
						</tr>
					</thead>

					{/* Body */}
					<tbody>
						{data.members.map((member, idx) => {
							const bgColor = stringToColor(member.name || member.userId);

							return (
								<tr
									key={member.userId}
									className={`
                                        group transition-colors
                                        ${member.highlightWarning ? "bg-warning/5" : "hover:bg-hover"}
                                        ${idx !== data.members.length - 1 ? "border-b border-border" : ""}
                                    `}>
									{/* Member cell */}
									<td className="sticky left-0 z-10 bg-background px-3 py-2 w-[200px]">
										<button
											onClick={() => setSelectedMember(member)}
											className="flex items-center gap-2 w-full text-left hover:bg-surface -mx-2 px-2 py-1 rounded-md transition-colors">
											{/* Warning indicator */}
											{member.highlightWarning && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-warning" />}

											{/* Avatar */}
											<div
												className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold text-background-dark shrink-0"
												style={{ backgroundColor: bgColor }}>
												{member.avatarUrl ? (
													<img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-md object-cover" />
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
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-1.5">
													<span className="font-medium text-white text-sm truncate">{member.name}</span>
													{member.highlightWarning && (
														<span className="flex items-center gap-0.5 text-xs font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded">
															<AlertTriangle size={10} />
															{member.declineStreak}
														</span>
													)}
												</div>
											</div>
										</button>
									</td>

									{/* Attendance cells */}
									{data.events.map((event) => {
										const cellKey = `${event.id}${CELL_KEY_DELIMITER}${member.userId}`;
										return (
											<td key={event.id} className="px-2 py-2 border-l border-border w-[72px]">
												<div className="flex items-center justify-center">
													<AttendanceCell
														record={getRecord(event.id, member.userId)}
														event={event}
														onClick={(e) => handleCellClick(event, member, e.currentTarget)}
														isBulkMode={isBulkMode}
														isSelected={selectedCells.has(cellKey)}
													/>
												</div>
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Legend */}
			<div className="flex flex-wrap items-center justify-center gap-4 lg:gap-5 py-3 border-t border-border text-xs text-muted">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded flex items-center justify-center text-white/20">
						<span className="text-[10px] font-medium">/</span>
					</div>
					<span>N/A</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-hover flex items-center justify-center text-muted">
						<HelpCircle size={12} />
					</div>
					<span>Invited</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-info/20 flex items-center justify-center text-info">
						<Check size={12} strokeWidth={3} />
					</div>
					<span>Accepted</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-success/20 flex items-center justify-center text-success">
						<Check size={12} strokeWidth={3} />
					</div>
					<span>Attended</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-error/20 flex items-center justify-center text-error">
						<X size={12} strokeWidth={3} />
					</div>
					<span>Declined</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-warning/20 flex items-center justify-center text-warning">
						<Minus size={12} strokeWidth={3} />
					</div>
					<span>No-show</span>
				</div>
			</div>

			{/* Quick Status Popover */}
			{selectedCell && (
				<QuickStatusPopover
					record={getRecord(selectedCell.event.id, selectedCell.member.userId)}
					event={selectedCell.event}
					member={selectedCell.member}
					anchorRect={selectedCell.anchorRect}
					onClose={() => setSelectedCell(null)}
					onUpdate={handleUpdate}
					isLoading={isUpdating}
				/>
			)}

			{/* Bulk Action Bar */}
			{isBulkMode && (
				<BulkActionBar
					selectedCount={selectedCells.size}
					onApplyStatus={handleBulkUpdate}
					onSelectAll={selectAll}
					onClearSelection={clearSelection}
					onExitBulkMode={toggleBulkMode}
					isLoading={isUpdating}
				/>
			)}

			{/* Member Detail Modal */}
			{selectedMember && (
				<MemberDetailModal
					member={selectedMember}
					events={data.events}
					records={data.records}
					onClose={() => setSelectedMember(null)}
				/>
			)}
		</>
	);
}
