"use client";

import {
    AttendanceRecord,
    AttendanceStatus,
    PaymentStatus,
    AttendanceEvent,
} from "@/lib/models/Attendance";
import { Check, X, Minus, HelpCircle, DollarSign } from "lucide-react";

interface AttendanceCellProps {
    record: AttendanceRecord | null;
    event: AttendanceEvent;
    onClick: () => void;
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

export default function AttendanceCell({
    record,
    event,
    onClick,
}: AttendanceCellProps) {
    const status = record?.status ?? AttendanceStatus.Invited;
    const config = STATUS_CONFIG[status];

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
                relative w-11 h-9 rounded-lg
                ${config.bg} ${config.textColor}
                hover:ring-2 hover:ring-white/20 hover:scale-105
                active:scale-95
                transition-all duration-150 ease-out
                flex items-center justify-center
                group
            `}
            title={`${AttendanceStatus[status]}${showPaymentBadge ? ` (${isPaid ? "Paid" : "Unpaid"})` : ""}`}
        >
            {config.icon}

            {/* Payment indicator */}
            {showPaymentBadge && (
                <span
                    className={`
                        absolute -top-1.5 -right-1.5
                        w-4 h-4 rounded-full
                        flex items-center justify-center
                        text-white text-[9px] font-bold
                        shadow-sm
                        ${isPaid ? "bg-success" : "bg-error"}
                    `}
                >
                    <DollarSign size={9} />
                </span>
            )}

            {/* Hover ring effect */}
            <span className="absolute inset-0 rounded-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all" />
        </button>
    );
}
