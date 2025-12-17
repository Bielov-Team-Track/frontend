export enum AttendanceStatus {
    Invited = 0,
    Accepted = 1,
    Declined = 2,
    Attended = 3,
    NoShow = 4,
}

export enum PaymentStatus {
    Unpaid = 0,
    Paid = 1,
}

export interface AttendanceRecord {
    id: string;
    userId: string;
    eventId: string;
    status: AttendanceStatus;
    paymentStatus: PaymentStatus | null;
    declineNote: string | null;
    updatedAt: string;
    updatedByUserId: string | null;
    updatedByUserName: string | null;
}

export interface AttendanceEvent {
    id: string;
    name: string;
    date: string;
    isFree: boolean;
}

export interface AttendanceMember {
    userId: string;
    name: string;
    avatarUrl: string | null;
    highlightWarning: boolean;
    declineStreak: number;
}

export interface AttendanceMatrix {
    events: AttendanceEvent[];
    members: AttendanceMember[];
    records: AttendanceRecord[];
}

export interface AttendanceFilter {
    clubId?: string;
    organizerId?: string;
    groupId?: string;
    teamId?: string;
    startDate: string;
    endDate: string;
}

export interface UpdateAttendanceRequest {
    status: AttendanceStatus;
    declineNote?: string;
    paymentStatus?: PaymentStatus;
}

export type TimeRange = "1week" | "2weeks" | "1month" | "3months" | "6months" | "custom";
