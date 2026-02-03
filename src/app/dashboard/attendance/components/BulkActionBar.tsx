"use client";

import { AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { Check, CheckSquare, DollarSign, HelpCircle, Minus, Square, X } from "lucide-react";

interface BulkActionBarProps {
	selectedCount: number;
	onApplyStatus: (status: AttendanceStatus, paymentStatus?: PaymentStatus) => void;
	onSelectAll: () => void;
	onClearSelection: () => void;
	onExitBulkMode: () => void;
	isLoading?: boolean;
}

const STATUS_OPTIONS = [
	{
		status: AttendanceStatus.Invited,
		label: "Invited",
		icon: HelpCircle,
		bg: "bg-white/10 hover:bg-white/20",
		textColor: "text-muted",
	},
	{
		status: AttendanceStatus.Accepted,
		label: "Accepted",
		icon: Check,
		bg: "bg-info/20 hover:bg-info/30",
		textColor: "text-info",
	},
	{
		status: AttendanceStatus.Attended,
		label: "Attended",
		icon: Check,
		bg: "bg-success/20 hover:bg-success/30",
		textColor: "text-success",
	},
	{
		status: AttendanceStatus.Declined,
		label: "Declined",
		icon: X,
		bg: "bg-error/20 hover:bg-error/30",
		textColor: "text-error",
	},
	{
		status: AttendanceStatus.NoShow,
		label: "No-show",
		icon: Minus,
		bg: "bg-warning/20 hover:bg-warning/30",
		textColor: "text-warning",
	},
];

export default function BulkActionBar({
	selectedCount,
	onApplyStatus,
	onSelectAll,
	onClearSelection,
	onExitBulkMode,
	isLoading = false,
}: BulkActionBarProps) {
	return (
		<div className="fixed bottom-0 left-0 right-0 z-40 animate-in slide-in-from-bottom-4 duration-200">
			<div className="bg-[#1a1a1a] border-t border-white/10 shadow-2xl">
				<div className="max-w-7xl mx-auto px-4 py-3">
					<div className="flex flex-col sm:flex-row items-center gap-3">
						{/* Selection info & controls */}
						<div className="flex items-center gap-3 w-full sm:w-auto">
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-white">
									{selectedCount} selected
								</span>
								<div className="flex items-center gap-1">
									<button
										onClick={onSelectAll}
										className="p-1.5 rounded hover:bg-white/10 text-muted hover:text-white transition-colors"
										title="Select all"
									>
										<CheckSquare size={16} />
									</button>
									<button
										onClick={onClearSelection}
										disabled={selectedCount === 0}
										className="p-1.5 rounded hover:bg-white/10 text-muted hover:text-white transition-colors disabled:opacity-50"
										title="Clear selection"
									>
										<Square size={16} />
									</button>
								</div>
							</div>

							{/* Divider */}
							<div className="hidden sm:block w-px h-6 bg-white/10" />
						</div>

						{/* Status buttons */}
						<div className="flex items-center gap-1.5 flex-1 justify-center overflow-x-auto py-1">
							{STATUS_OPTIONS.map((option) => {
								const Icon = option.icon;
								return (
									<button
										key={option.status}
										onClick={() => onApplyStatus(option.status)}
										disabled={isLoading || selectedCount === 0}
										className={`
											flex items-center gap-1.5 px-3 py-2 rounded-lg
											text-sm font-medium whitespace-nowrap
											transition-all duration-100 touch-manipulation
											${option.bg} ${option.textColor}
											disabled:opacity-50 disabled:cursor-not-allowed
											active:scale-95
										`}
									>
										<Icon size={16} />
										<span className="hidden sm:inline">{option.label}</span>
									</button>
								);
							})}

							{/* Divider */}
							<div className="hidden sm:block w-px h-6 bg-white/10 mx-1" />

							{/* Payment buttons */}
							<button
								onClick={() => onApplyStatus(AttendanceStatus.Attended, PaymentStatus.Paid)}
								disabled={isLoading || selectedCount === 0}
								className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-100 bg-success/20 hover:bg-success/30 text-success disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
							>
								<DollarSign size={16} />
								<span className="hidden sm:inline">Paid</span>
							</button>
							<button
								onClick={() => onApplyStatus(AttendanceStatus.Attended, PaymentStatus.Unpaid)}
								disabled={isLoading || selectedCount === 0}
								className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-100 bg-error/20 hover:bg-error/30 text-error disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
							>
								<DollarSign size={16} />
								<span className="hidden sm:inline">Unpaid</span>
							</button>
						</div>

						{/* Exit button */}
						<button
							onClick={onExitBulkMode}
							className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
						>
							Done
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
