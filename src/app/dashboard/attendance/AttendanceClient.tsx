"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import {
    TimeRange,
    AttendanceStatus,
    PaymentStatus,
} from "@/lib/models/Attendance";
import { getAttendanceMatrix, updateAttendance } from "@/lib/api/attendance";
import { Loader } from "@/components/ui";
import {
    Calendar,
    Users,
    TrendingDown,
    CheckCircle,
    XCircle,
} from "lucide-react";
import TimeRangeSelector from "./components/TimeRangeSelector";
import AttendanceFilters from "./components/AttendanceFilters";
import AttendanceTable from "./components/AttendanceTable";

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

// Stat card component matching dashboard style
function StatCard({
    label,
    value,
    icon: Icon,
    colorClass = "text-muted",
    bgClass = "bg-white/5"
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    colorClass?: string;
    bgClass?: string;
}) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className={`p-2.5 rounded-lg ${bgClass}`}>
                <Icon size={18} className={colorClass} />
            </div>
            <div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-muted">{label}</div>
            </div>
        </div>
    );
}

export default function AttendanceClient({ userId }: AttendanceClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // Filter state from URL
    const [timeRange, setTimeRange] = useState<TimeRange>(
        (searchParams.get("range") as TimeRange) || "1month"
    );
    const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
    const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
    const [clubId, setClubId] = useState<string | null>(
        searchParams.get("clubId")
    );
    const [organizerId, setOrganizerId] = useState<string | null>(
        searchParams.get("organizerId")
    );
    const [groupId, setGroupId] = useState<string | null>(
        searchParams.get("groupId")
    );
    const [teamId, setTeamId] = useState<string | null>(
        searchParams.get("teamId")
    );

    // Build filter object
    const filter = useMemo(() => {
        const dateRange = getDateRange(timeRange, customStartDate, customEndDate);
        return {
            ...dateRange,
            clubId: clubId || undefined,
            organizerId: organizerId || undefined,
            groupId: groupId || undefined,
            teamId: teamId || undefined,
        };
    }, [timeRange, customStartDate, customEndDate, clubId, organizerId, groupId, teamId]);

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

    const handleUpdateAttendance = (
        eventId: string,
        oduserId: string,
        status: AttendanceStatus,
        note?: string,
        paymentStatus?: PaymentStatus
    ) => {
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

    // Calculate stats from data
    const stats = useMemo(() => {
        if (!data) return null;

        const totalMembers = data.members.length;
        const totalEvents = data.events.length;
        const warningMembers = data.members.filter(m => m.highlightWarning).length;

        const attended = data.records.filter(r => r.status === AttendanceStatus.Attended).length;
        const declined = data.records.filter(r => r.status === AttendanceStatus.Declined || r.status === AttendanceStatus.NoShow).length;
        const pending = data.records.filter(r => r.status === AttendanceStatus.Invited).length;

        return { totalMembers, totalEvents, warningMembers, attended, declined, pending };
    }, [data]);

    return (
        <div className="min-h-full p-6 lg:p-10 space-y-6 font-sans">
            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Attendance Tracker
                    </h1>
                    <p className="text-sm text-muted mt-1">
                        Monitor member participation and payment status across events
                    </p>
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
                />
            </div>

            {/* --- STATS ROW --- */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        label="Total Events"
                        value={stats.totalEvents}
                        icon={Calendar}
                        colorClass="text-accent"
                        bgClass="bg-accent/10"
                    />
                    <StatCard
                        label="Members"
                        value={stats.totalMembers}
                        icon={Users}
                        colorClass="text-primary"
                        bgClass="bg-primary/10"
                    />
                    <StatCard
                        label="Attended"
                        value={stats.attended}
                        icon={CheckCircle}
                        colorClass="text-success"
                        bgClass="bg-success/10"
                    />
                    <StatCard
                        label="Declined/No-show"
                        value={stats.declined}
                        icon={XCircle}
                        colorClass="text-error"
                        bgClass="bg-error/10"
                    />
                    {stats.warningMembers > 0 && (
                        <StatCard
                            label="Need Attention"
                            value={stats.warningMembers}
                            icon={TrendingDown}
                            colorClass="text-warning"
                            bgClass="bg-warning/10"
                        />
                    )}
                </div>
            )}

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
                ) : data ? (
                    <AttendanceTable
                        data={data}
                        onUpdateAttendance={handleUpdateAttendance}
                        isUpdating={updateMutation.isPending}
                    />
                ) : null}
            </div>
        </div>
    );
}
