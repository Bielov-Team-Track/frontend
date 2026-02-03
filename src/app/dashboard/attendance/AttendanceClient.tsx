"use client";

import { Loader } from "@/components/ui";
import { getAttendanceMatrix, updateAttendance } from "@/lib/api/attendance";
import { AttendanceStatus, PaymentStatus, TimeRange } from "@/lib/models/Attendance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Calendar, CheckCircle, DollarSign, Search, TrendingDown, Users, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import AttendanceFilters from "./components/AttendanceFilters";
import AttendanceTable from "./components/AttendanceTable";
import TimeRangeSelector from "./components/TimeRangeSelector";

interface AttendanceClientProps {
	userId: string;
}

function getDateRange(range: TimeRange, customStart?: Date, customEnd?: Date) {
	const end = new Date();
	let start = new Date();

	switch (range) {
		case "1week":
			start.setDate(end.getDate() - 7);
			break;
		case "2weeks":
			start.setDate(end.getDate() - 14);
			break;
		case "1month":
			start.setMonth(end.getMonth() - 1);
			break;
		case "3months":
			start.setMonth(end.getMonth() - 3);
			break;
		case "6months":
			start.setMonth(end.getMonth() - 6);
			break;
		case "custom":
			start = customStart || start;
			return {
				startDate: start.toISOString(),
				endDate: (customEnd || end).toISOString(),
			};
	}

	return {
		startDate: start.toISOString(),
		endDate: end.toISOString(),
	};
}

// Stat card component
function StatCard({
	label,
	value,
	icon: Icon,
	colorClass = "text-muted",
	bgClass = "bg-white/5",
}: {
	label: string;
	value: string | number;
	icon: React.ElementType;
	colorClass?: string;
	bgClass?: string;
}) {
	return (
		<div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
			<div className={`p-2 rounded-md ${bgClass}`}>
				<Icon size={18} className={colorClass} />
			</div>
			<div>
				<div className="text-xl font-semibold text-white leading-tight">{value}</div>
				<div className="text-sm text-muted">{label}</div>
			</div>
		</div>
	);
}

export default function AttendanceClient({ userId }: AttendanceClientProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();

	// Filter state from URL
	const [timeRange, setTimeRange] = useState<TimeRange>((searchParams.get("range") as TimeRange) || "1month");
	const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
	const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
	const [clubId, setClubId] = useState<string | null>(searchParams.get("clubId"));
	const [organizerId, setOrganizerId] = useState<string | null>(searchParams.get("organizerId"));
	const [groupId, setGroupId] = useState<string | null>(searchParams.get("groupId"));
	const [teamId, setTeamId] = useState<string | null>(searchParams.get("teamId"));
	const [seriesId, setSeriesId] = useState<string | null>(searchParams.get("seriesId"));

	// Member search and filters
	const [memberSearch, setMemberSearch] = useState("");
	const [showOnlyAttention, setShowOnlyAttention] = useState(false);
	const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);

	// Build filter object
	const filter = useMemo(() => {
		const dateRange = getDateRange(timeRange, customStartDate, customEndDate);
		return {
			...dateRange,
			clubId: clubId || undefined,
			organizerId: organizerId || undefined,
			groupId: groupId || undefined,
			teamId: teamId || undefined,
			seriesId: seriesId || undefined,
		};
	}, [timeRange, customStartDate, customEndDate, clubId, organizerId, groupId, teamId, seriesId]);

	// Fetch attendance data
	const { data, isLoading, error } = useQuery({
		queryKey: ["attendance", filter],
		queryFn: () => getAttendanceMatrix(filter),
	});

	// Update attendance mutation
	const updateMutation = useMutation({
		mutationFn: ({
			eventId,
			oduserId,
			status,
			declineNote,
			paymentStatus,
		}: {
			eventId: string;
			oduserId: string;
			status: AttendanceStatus;
			declineNote?: string;
			paymentStatus?: PaymentStatus;
		}) =>
			updateAttendance(eventId, oduserId, {
				status,
				declineNote,
				paymentStatus,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["attendance"] });
		},
	});

	const handleUpdateAttendance = (eventId: string, oduserId: string, status: AttendanceStatus, note?: string, paymentStatus?: PaymentStatus) => {
		updateMutation.mutate({
			eventId,
			oduserId,
			status,
			declineNote: note,
			paymentStatus,
		});
	};

	// Update URL when filters change
	const updateUrl = (params: Record<string, string | null>) => {
		const newParams = new URLSearchParams(searchParams.toString());
		Object.entries(params).forEach(([key, value]) => {
			if (value) {
				newParams.set(key, value);
			} else {
				newParams.delete(key);
			}
		});
		router.push(`?${newParams.toString()}`, { scroll: false });
	};

	// Filter members based on search and filters
	const filteredData = useMemo(() => {
		if (!data) return null;

		let filteredMembers = data.members;

		// Search filter (name)
		if (memberSearch.trim()) {
			const searchLower = memberSearch.toLowerCase().trim();
			filteredMembers = filteredMembers.filter((m) => m.name.toLowerCase().includes(searchLower));
		}

		// Attention filter
		if (showOnlyAttention) {
			filteredMembers = filteredMembers.filter((m) => m.highlightWarning);
		}

		// Unpaid filter - check if member has any unpaid records for non-free events
		if (showOnlyUnpaid) {
			const nonFreeEventIds = new Set(data.events.filter((e) => !e.isFree).map((e) => e.id));
			filteredMembers = filteredMembers.filter((m) => {
				return data.records.some(
					(r) =>
						r.userId === m.userId &&
						nonFreeEventIds.has(r.eventId) &&
						r.paymentStatus === PaymentStatus.Unpaid &&
						(r.status === AttendanceStatus.Accepted || r.status === AttendanceStatus.Attended || r.status === AttendanceStatus.NoShow)
				);
			});
		}

		return {
			...data,
			members: filteredMembers,
		};
	}, [data, memberSearch, showOnlyAttention, showOnlyUnpaid]);

	// Calculate stats from data (use original data for stats)
	const stats = useMemo(() => {
		if (!data) return null;

		const totalMembers = data.members.length;
		const totalEvents = data.events.length;
		const warningMembers = data.members.filter((m) => m.highlightWarning).length;

		const attended = data.records.filter((r) => r.status === AttendanceStatus.Attended).length;
		const declined = data.records.filter((r) => r.status === AttendanceStatus.Declined || r.status === AttendanceStatus.NoShow).length;
		const pending = data.records.filter((r) => r.status === AttendanceStatus.Invited).length;

		// Calculate unpaid count
		const nonFreeEventIds = new Set(data.events.filter((e) => !e.isFree).map((e) => e.id));
		const unpaidMembers = new Set(
			data.records
				.filter(
					(r) =>
						nonFreeEventIds.has(r.eventId) &&
						r.paymentStatus === PaymentStatus.Unpaid &&
						(r.status === AttendanceStatus.Accepted || r.status === AttendanceStatus.Attended || r.status === AttendanceStatus.NoShow)
				)
				.map((r) => r.userId)
		).size;

		return { totalMembers, totalEvents, warningMembers, attended, declined, pending, unpaidMembers };
	}, [data]);

	return (
		<div className="min-h-full p-6 lg:p-10 space-y-6 font-sans">
			{/* --- HEADER --- */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-white tracking-tight">Attendance Tracker</h1>
					<p className="text-sm text-muted mt-1">Monitor member participation and payment status across events</p>
				</div>

				<div className="flex items-center gap-3">
					<TimeRangeSelector
						value={timeRange}
						onChange={(v) => {
							setTimeRange(v);
							updateUrl({ range: v });
						}}
						customStartDate={customStartDate}
						customEndDate={customEndDate}
						onCustomDateChange={(start, end) => {
							setCustomStartDate(start);
							setCustomEndDate(end);
						}}
					/>
				</div>
			</div>

			{/* --- FILTERS (Always Visible) --- */}
			<div className="p-4 rounded-xl bg-white/5 border border-white/10">
				<AttendanceFilters
					clubId={clubId}
					organizerId={organizerId}
					groupId={groupId}
					teamId={teamId}
					seriesId={seriesId}
					onClubChange={(v) => {
						setClubId(v);
						updateUrl({ clubId: v });
					}}
					onOrganizerChange={(v) => {
						setOrganizerId(v);
						updateUrl({ organizerId: v });
					}}
					onGroupChange={(v) => {
						setGroupId(v);
						updateUrl({ groupId: v });
					}}
					onTeamChange={(v) => {
						setTeamId(v);
						updateUrl({ teamId: v });
					}}
					onSeriesChange={(v) => {
						setSeriesId(v);
						updateUrl({ seriesId: v });
					}}
				/>
			</div>

			{/* --- STATS ROW --- */}
			{stats && (
				<div className="flex flex-wrap gap-2">
					<StatCard label="Events" value={stats.totalEvents} icon={Calendar} colorClass="text-accent" bgClass="bg-accent/10" />
					<StatCard label="Members" value={stats.totalMembers} icon={Users} colorClass="text-primary" bgClass="bg-primary/10" />
					<StatCard label="Attended" value={stats.attended} icon={CheckCircle} colorClass="text-success" bgClass="bg-success/10" />
					<StatCard label="Declined" value={stats.declined} icon={XCircle} colorClass="text-error" bgClass="bg-error/10" />
					{stats.warningMembers > 0 && (
						<StatCard label="Attention" value={stats.warningMembers} icon={TrendingDown} colorClass="text-warning" bgClass="bg-warning/10" />
					)}
					{stats.unpaidMembers > 0 && (
						<StatCard label="Unpaid" value={stats.unpaidMembers} icon={DollarSign} colorClass="text-error" bgClass="bg-error/10" />
					)}
				</div>
			)}

			{/* --- MEMBER SEARCH & FILTERS --- */}
			<div className="flex flex-wrap items-center gap-4">
				{/* Search input */}
				<div className="relative flex-1 min-w-[200px] max-w-md">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
					<input
						type="text"
						placeholder="Search members by name..."
						value={memberSearch}
						onChange={(e) => setMemberSearch(e.target.value)}
						className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
					/>
				</div>

				{/* Filter toggles */}
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-2 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={showOnlyAttention}
							onChange={(e) => setShowOnlyAttention(e.target.checked)}
							className="w-4 h-4 rounded border-white/20 bg-white/5 text-warning focus:ring-warning/50 focus:ring-offset-0"
						/>
						<span className="flex items-center gap-1.5 text-sm text-white/80">
							<AlertTriangle size={14} className="text-warning" />
							Needs attention
						</span>
					</label>

					<label className="flex items-center gap-2 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={showOnlyUnpaid}
							onChange={(e) => setShowOnlyUnpaid(e.target.checked)}
							className="w-4 h-4 rounded border-white/20 bg-white/5 text-error focus:ring-error/50 focus:ring-offset-0"
						/>
						<span className="flex items-center gap-1.5 text-sm text-white/80">
							<DollarSign size={14} className="text-error" />
							Unpaid only
						</span>
					</label>
				</div>

				{/* Active filters indicator */}
				{(memberSearch || showOnlyAttention || showOnlyUnpaid) && filteredData && (
					<div className="text-xs text-muted">
						Showing {filteredData.members.length} of {data?.members.length} members
					</div>
				)}
			</div>

			{/* --- TABLE --- */}
			<div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
				{isLoading ? (
					<div className="flex items-center justify-center h-96">
						<Loader />
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center h-96 text-center">
						<XCircle size={48} className="text-error/50 mb-4" />
						<p className="text-error font-medium">Failed to load attendance data</p>
						<p className="text-sm text-muted mt-1">Please try again later</p>
					</div>
				) : filteredData ? (
					<AttendanceTable data={filteredData} onUpdateAttendance={handleUpdateAttendance} isUpdating={updateMutation.isPending} />
				) : null}
			</div>
		</div>
	);
}
