"use client";

import { useState, useMemo } from "react";
import {
    AttendanceMatrix,
    AttendanceRecord,
    AttendanceStatus,
    PaymentStatus,
    AttendanceEvent,
    AttendanceMember,
} from "@/lib/models/Attendance";
import AttendanceCell from "./AttendanceCell";
import CellPopover from "./CellPopover";
import { AlertTriangle, Calendar, User, Users, Check, X, Minus, HelpCircle } from "lucide-react";
import { stringToColor } from "@/lib/utils/color";

interface AttendanceTableProps {
    data: AttendanceMatrix;
    onUpdateAttendance: (
        eventId: string,
        userId: string,
        status: AttendanceStatus,
        note?: string,
        paymentStatus?: PaymentStatus
    ) => void;
    isUpdating?: boolean;
}

export default function AttendanceTable({
    data,
    onUpdateAttendance,
    isUpdating = false,
}: AttendanceTableProps) {
    const [selectedCell, setSelectedCell] = useState<{
        event: AttendanceEvent;
        member: AttendanceMember;
    } | null>(null);

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

    const handleCellClick = (event: AttendanceEvent, member: AttendanceMember) => {
        setSelectedCell({ event, member });
    };

    const handleUpdate = (
        status: AttendanceStatus,
        note?: string,
        paymentStatus?: PaymentStatus
    ) => {
        if (selectedCell) {
            onUpdateAttendance(
                selectedCell.event.id,
                selectedCell.member.userId,
                status,
                note,
                paymentStatus
            );
            setSelectedCell(null);
        }
    };

    if (data.members.length === 0 || data.events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Users size={28} className="text-muted" />
                </div>
                <p className="text-lg font-medium text-white mb-1">No attendance data</p>
                <p className="text-sm text-muted max-w-sm">
                    No events or members found for the selected filters. Try adjusting your date range or filters.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    {/* Header */}
                    <thead>
                        <tr>
                            {/* Member column header */}
                            <th className="sticky left-0 z-20 bg-background-dark px-4 py-3 text-left min-w-[200px]">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
                                    <User size={14} />
                                    Member
                                </div>
                            </th>
                            {/* Event column headers */}
                            {data.events.map((event) => {
                                const date = new Date(event.date);
                                const day = date.getDate();
                                const month = date.toLocaleString("default", { month: "short" });
                                const weekday = date.toLocaleString("default", { weekday: "short" });

                                return (
                                    <th
                                        key={event.id}
                                        className="px-2 py-3 text-center min-w-[70px] border-l border-white/5"
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10">
                                                <span className="text-sm font-bold text-white leading-none">
                                                    {day}
                                                </span>
                                                <span className="text-[9px] font-semibold text-muted uppercase">
                                                    {month}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-muted font-medium">
                                                {weekday}
                                            </span>
                                            <span
                                                className="text-[10px] text-white/70 font-medium truncate max-w-[60px]"
                                                title={event.name}
                                            >
                                                {event.name.length > 8
                                                    ? event.name.slice(0, 8) + "…"
                                                    : event.name}
                                            </span>
                                            {event.isFree && (
                                                <span className="text-[9px] text-success font-bold">
                                                    FREE
                                                </span>
                                            )}
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
                                        ${member.highlightWarning ? "bg-warning/5" : "hover:bg-white/2"}
                                        ${idx !== data.members.length - 1 ? "border-b border-white/5" : ""}
                                    `}
                                >
                                    {/* Member cell */}
                                    <td className="sticky left-0 z-10 bg-background-dark px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {/* Warning indicator */}
                                            {member.highlightWarning && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
                                            )}

                                            {/* Avatar */}
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-background-dark shrink-0"
                                                style={{ backgroundColor: bgColor }}
                                            >
                                                {member.avatarUrl ? (
                                                    <img
                                                        src={member.avatarUrl}
                                                        alt={member.name}
                                                        className="w-full h-full rounded-lg object-cover"
                                                    />
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
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white text-sm truncate">
                                                        {member.name}
                                                    </span>
                                                    {member.highlightWarning && (
                                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                                                            <AlertTriangle size={10} />
                                                            {member.declineStreak}
                                                        </span>
                                                    )}
                                                </div>
                                                {member.highlightWarning && (
                                                    <span className="text-[10px] text-warning/70">
                                                        {member.declineStreak} consecutive declines
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Attendance cells */}
                                    {data.events.map((event) => (
                                        <td
                                            key={event.id}
                                            className="px-2 py-3 text-center border-l border-white/5"
                                        >
                                            <AttendanceCell
                                                record={getRecord(event.id, member.userId)}
                                                event={event}
                                                onClick={() => handleCellClick(event, member)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 py-4 border-t border-white/5 text-xs text-muted">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-muted">
                        <HelpCircle size={12} />
                    </div>
                    <span>Invited</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-info/20 flex items-center justify-center text-info">
                        <Check size={12} strokeWidth={3} />
                    </div>
                    <span>Accepted</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-success/20 flex items-center justify-center text-success">
                        <Check size={12} strokeWidth={3} />
                    </div>
                    <span>Attended</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-error/20 flex items-center justify-center text-error">
                        <X size={12} strokeWidth={3} />
                    </div>
                    <span>Declined</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-warning/20 flex items-center justify-center text-warning">
                        <Minus size={12} strokeWidth={3} />
                    </div>
                    <span>No-show</span>
                </div>
            </div>

            {/* Popover */}
            {selectedCell && (
                <CellPopover
                    record={getRecord(selectedCell.event.id, selectedCell.member.userId)}
                    event={selectedCell.event}
                    member={selectedCell.member}
                    onClose={() => setSelectedCell(null)}
                    onUpdate={handleUpdate}
                    isLoading={isUpdating}
                />
            )}
        </>
    );
}
