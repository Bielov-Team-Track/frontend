"use client";

import {
    AttendanceRecord,
    AttendanceStatus,
    PaymentStatus,
    AttendanceEvent,
} from "@/lib/models/Attendance";
import { Check, X, Minus, HelpCircle, DollarSign, Clock } from "lucide-react";

interface AttendanceCellProps {
    record: AttendanceRecord | null;
    event: AttendanceEvent;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isBulkMode?: boolean;
    isSelected?: boolean;
}

const STATUS_CONFIG: Record<
    AttendanceStatus,
    { bg: string; textColor: string; icon: React.ReactNode }
> = {
    [AttendanceStatus.Invited]: {
        bg: "bg-white/10",
        textColor: "text-muted",
        icon: <HelpCircle size={14} />,
    },
    [AttendanceStatus.Waitlisted]: {
        bg: "bg-amber-500/20",
        textColor: "text-amber-400",
        icon: <Clock size={14} />,
    },
    [AttendanceStatus.Accepted]: {
        bg: "bg-info/20",
        textColor: "text-info",
        icon: <Check size={14} strokeWidth={3} />,
    },
    [AttendanceStatus.Declined]: {
        bg: "bg-error/20",
        textColor: "text-error",
        icon: <X size={14} strokeWidth={3} />,
    },
    [AttendanceStatus.Attended]: {
        bg: "bg-success/20",
        textColor: "text-success",
        icon: <Check size={14} strokeWidth={3} />,
    },
    [AttendanceStatus.NoShow]: {
        bg: "bg-warning/20",
        textColor: "text-warning",
        icon: <Minus size={14} strokeWidth={3} />,
    },
};

const DEFAULT_CONFIG = {
    bg: "bg-white/10",
    textColor: "text-muted",
    icon: <HelpCircle size={14} />,
};

export default function AttendanceCell({
    record,
    event,
    onClick,
    isBulkMode = false,
    isSelected = false,
}: AttendanceCellProps) {
    // If no record exists, user was not invited - show empty cell
    if (!record) {
        return (
            <div
                className="w-10 h-8 rounded-md flex items-center justify-center text-white/20"
                title="Not invited"
            >
                <span className="text-xs font-medium">/</span>
            </div>
        );
    }

    const status = record.status;
    const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;

    const showPaymentBadge =
        !event.isFree &&
        record?.paymentStatus !== undefined &&
        record?.paymentStatus !== null &&
        (status === AttendanceStatus.Accepted ||
            status === AttendanceStatus.Attended ||
            status === AttendanceStatus.NoShow);

    const isPaid = record?.paymentStatus === PaymentStatus.Paid;

    return (
        <button
            onClick={onClick}
            className={`
                relative w-10 h-8 rounded-md
                ${config.bg} ${config.textColor}
                hover:ring-1 hover:ring-white/20 hover:scale-105
                active:scale-95
                transition-all duration-150 ease-out
                flex items-center justify-center
                group
                ${isSelected ? "ring-2 ring-primary scale-105" : ""}
            `}
            title={`${AttendanceStatus[status]}${showPaymentBadge ? ` (${isPaid ? "Paid" : "Unpaid"})` : ""}`}
        >
            {config.icon}

            {/* Bulk mode selection indicator */}
            {isBulkMode && (
                <span
                    className={`
                        absolute -top-1.5 -left-1.5
                        w-4 h-4 rounded-full
                        flex items-center justify-center
                        text-white text-[10px] font-bold
                        border-2 border-background
                        transition-colors duration-100
                        ${isSelected ? "bg-primary" : "bg-white/20"}
                    `}
                >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                </span>
            )}

            {/* Payment indicator */}
            {showPaymentBadge && (
                <span
                    className={`
                        absolute -top-1 -right-1
                        w-4 h-4 rounded-full
                        flex items-center justify-center
                        text-white text-xs font-bold
                        shadow-xs
                        ${isPaid ? "bg-success" : "bg-error"}
                    `}
                >
                    <DollarSign size={10} />
                </span>
            )}

            {/* Hover ring effect */}
            <span className="absolute inset-0 rounded-md ring-1 ring-white/10 group-hover:ring-white/20 transition-all" />
        </button>
    );
}
