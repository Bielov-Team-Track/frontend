"use client";

import { TimeRange } from "@/lib/models/Attendance";
import { Dropdown } from "@/components/ui";
import { DropdownOption } from "@/components/ui/dropdown";
import { Calendar } from "lucide-react";

interface TimeRangeSelectorProps {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
    customStartDate?: Date;
    customEndDate?: Date;
    onCustomDateChange?: (start: Date, end: Date) => void;
}

const TIME_RANGE_OPTIONS: DropdownOption<string>[] = [
    { value: "1week", label: "1 Week" },
    { value: "2weeks", label: "2 Weeks" },
    { value: "1month", label: "1 Month" },
    { value: "3months", label: "3 Months" },
    { value: "6months", label: "6 Months" },
    { value: "custom", label: "Custom Range" },
];

export default function TimeRangeSelector({
    value,
    onChange,
    customStartDate,
    customEndDate,
    onCustomDateChange,
}: TimeRangeSelectorProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="min-w-[150px]">
                <Dropdown
                    options={TIME_RANGE_OPTIONS}
                    value={value}
                    onChange={(val) => onChange(val as TimeRange)}
                    size="sm"
                    leftIcon={<Calendar size={14} />}
                />
            </div>

            {value === "custom" && onCustomDateChange && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <input
                        type="date"
                        value={customStartDate?.toISOString().split("T")[0] || ""}
                        onChange={(e) =>
                            onCustomDateChange(
                                new Date(e.target.value),
                                customEndDate || new Date()
                            )
                        }
                        className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-hidden focus:border-white/20 focus:bg-white/[0.07] transition-all"
                    />
                    <span className="text-muted text-sm">to</span>
                    <input
                        type="date"
                        value={customEndDate?.toISOString().split("T")[0] || ""}
                        onChange={(e) =>
                            onCustomDateChange(
                                customStartDate || new Date(),
                                new Date(e.target.value)
                            )
                        }
                        className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-hidden focus:border-white/20 focus:bg-white/[0.07] transition-all"
                    />
                </div>
            )}
        </div>
    );
}
