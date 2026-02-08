"use client";

import { Input, Select } from "@/components/ui";
import { SelectOption } from "@/components/ui/select/index";
import { TimeRange } from "@/lib/models/Attendance";
import { Calendar } from "lucide-react";

interface TimeRangeSelectorProps {
	value: TimeRange;
	onChange: (value: TimeRange) => void;
	customStartDate?: Date;
	customEndDate?: Date;
	onCustomDateChange?: (start: Date, end: Date) => void;
}

const TIME_RANGE_OPTIONS: SelectOption[] = [
	{ value: "1week", label: "1 Week" },
	{ value: "2weeks", label: "2 Weeks" },
	{ value: "1month", label: "1 Month" },
	{ value: "3months", label: "3 Months" },
	{ value: "6months", label: "6 Months" },
	{ value: "custom", label: "Custom Range" },
];

export default function TimeRangeSelector({ value, onChange, customStartDate, customEndDate, onCustomDateChange }: TimeRangeSelectorProps) {
	return (
		<div className="flex items-center gap-3">
			<div className="min-w-37.5">
				<Select options={TIME_RANGE_OPTIONS} value={value} onChange={(val) => onChange(val as TimeRange)} leftIcon={<Calendar size={14} />} />
			</div>

			{value === "custom" && onCustomDateChange && (
				<div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
					<Input
						type="date"
						value={customStartDate?.toISOString().split("T")[0] || ""}
						onChange={(e) => onCustomDateChange(new Date(e.target.value), customEndDate || new Date())}
					/>
					<span className="text-muted text-sm">to</span>
					<Input
						type="date"
						value={customEndDate?.toISOString().split("T")[0] || ""}
						onChange={(e) => onCustomDateChange(customStartDate || new Date(), new Date(e.target.value))}
					/>
				</div>
			)}
		</div>
	);
}
