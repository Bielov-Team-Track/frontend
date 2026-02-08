import {
    AttendanceMatrix,
    AttendanceStatus,
    PaymentStatus,
} from "@/lib/models/Attendance";

export const mockAttendanceData: AttendanceMatrix = {
    events: [
        { id: "e1", name: "Tuesday Practice", date: "2024-11-05T18:00:00Z", isFree: false },
        { id: "e2", name: "Thursday Game", date: "2024-11-07T19:00:00Z", isFree: false },
        { id: "e3", name: "Saturday Tournament", date: "2024-11-09T10:00:00Z", isFree: false },
        { id: "e4", name: "Tuesday Practice", date: "2024-11-12T18:00:00Z", isFree: true },
        { id: "e5", name: "Thursday Game", date: "2024-11-14T19:00:00Z", isFree: false },
        { id: "e6", name: "Saturday Social", date: "2024-11-16T14:00:00Z", isFree: true },
        { id: "e7", name: "Tuesday Practice", date: "2024-11-19T18:00:00Z", isFree: false },
        { id: "e8", name: "Championship Final", date: "2024-11-23T16:00:00Z", isFree: false },
    ],
    members: [
        { userId: "u1", name: "Alex Johnson", avatarUrl: null, highlightWarning: false, declineStreak: 0 },
        { userId: "u2", name: "Maria Garcia", avatarUrl: null, highlightWarning: false, declineStreak: 1 },
        { userId: "u3", name: "James Wilson", avatarUrl: null, highlightWarning: true, declineStreak: 3 },
        { userId: "u4", name: "Emma Brown", avatarUrl: null, highlightWarning: false, declineStreak: 0 },
        { userId: "u5", name: "Michael Davis", avatarUrl: null, highlightWarning: false, declineStreak: 2 },
        { userId: "u6", name: "Sofia Martinez", avatarUrl: null, highlightWarning: true, declineStreak: 4 },
        { userId: "u7", name: "David Lee", avatarUrl: null, highlightWarning: false, declineStreak: 0 },
        { userId: "u8", name: "Isabella Taylor", avatarUrl: null, highlightWarning: false, declineStreak: 1 },
        { userId: "u9", name: "Daniel Anderson", avatarUrl: null, highlightWarning: false, declineStreak: 0 },
        { userId: "u10", name: "Olivia Thomas", avatarUrl: null, highlightWarning: false, declineStreak: 0 },
    ],
    records: [
        // Alex Johnson - consistent attender
        { id: "r1", userId: "u1", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r2", userId: "u1", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r3", userId: "u1", eventId: "e3", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-09T14:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r4", userId: "u1", eventId: "e4", status: AttendanceStatus.Attended, paymentStatus: null, declineNote: null, updatedAt: "2024-11-12T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r5", userId: "u1", eventId: "e5", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r6", userId: "u1", eventId: "e6", status: AttendanceStatus.Accepted, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r7", userId: "u1", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r8", userId: "u1", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Unpaid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // Maria Garcia - mostly attends
        { id: "r9", userId: "u2", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r10", userId: "u2", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r11", userId: "u2", eventId: "e3", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Family event", updatedAt: "2024-11-08T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r12", userId: "u2", eventId: "e4", status: AttendanceStatus.Attended, paymentStatus: null, declineNote: null, updatedAt: "2024-11-12T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r13", userId: "u2", eventId: "e5", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r14", userId: "u2", eventId: "e6", status: AttendanceStatus.Accepted, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r15", userId: "u2", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r16", userId: "u2", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // James Wilson - WARNING: 3 declines in a row
        { id: "r17", userId: "u3", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r18", userId: "u3", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r19", userId: "u3", eventId: "e3", status: AttendanceStatus.NoShow, paymentStatus: PaymentStatus.Unpaid, declineNote: null, updatedAt: "2024-11-09T14:00:00Z", updatedByUserId: "admin1", updatedByUserName: "Admin" },
        { id: "r20", userId: "u3", eventId: "e4", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Work conflict", updatedAt: "2024-11-11T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r21", userId: "u3", eventId: "e5", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Still busy", updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r22", userId: "u3", eventId: "e6", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Out of town", updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r23", userId: "u3", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r24", userId: "u3", eventId: "e8", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // Emma Brown - good attendance, some unpaid
        { id: "r25", userId: "u4", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r26", userId: "u4", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Unpaid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r27", userId: "u4", eventId: "e3", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-09T14:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r28", userId: "u4", eventId: "e4", status: AttendanceStatus.Attended, paymentStatus: null, declineNote: null, updatedAt: "2024-11-12T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r29", userId: "u4", eventId: "e5", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Unpaid, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r30", userId: "u4", eventId: "e6", status: AttendanceStatus.Accepted, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r31", userId: "u4", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r32", userId: "u4", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Unpaid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // Michael Davis - mixed attendance
        { id: "r33", userId: "u5", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r34", userId: "u5", eventId: "e2", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Injury", updatedAt: "2024-11-06T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r35", userId: "u5", eventId: "e3", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Still recovering", updatedAt: "2024-11-08T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r36", userId: "u5", eventId: "e4", status: AttendanceStatus.Attended, paymentStatus: null, declineNote: null, updatedAt: "2024-11-12T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r37", userId: "u5", eventId: "e5", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r38", userId: "u5", eventId: "e6", status: AttendanceStatus.Accepted, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r39", userId: "u5", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r40", userId: "u5", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // Sofia Martinez - WARNING: 4 declines in a row
        { id: "r41", userId: "u6", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r42", userId: "u6", eventId: "e2", status: AttendanceStatus.NoShow, paymentStatus: PaymentStatus.Unpaid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: "admin1", updatedByUserName: "Admin" },
        { id: "r43", userId: "u6", eventId: "e3", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Traveling", updatedAt: "2024-11-08T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r44", userId: "u6", eventId: "e4", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Still traveling", updatedAt: "2024-11-11T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r45", userId: "u6", eventId: "e5", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Not back yet", updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r46", userId: "u6", eventId: "e6", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Jetlag", updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r47", userId: "u6", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r48", userId: "u6", eventId: "e8", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // David Lee - excellent attendance
        { id: "r49", userId: "u7", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r50", userId: "u7", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r51", userId: "u7", eventId: "e3", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-09T14:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r52", userId: "u7", eventId: "e4", status: AttendanceStatus.Attended, paymentStatus: null, declineNote: null, updatedAt: "2024-11-12T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r53", userId: "u7", eventId: "e5", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r54", userId: "u7", eventId: "e6", status: AttendanceStatus.Accepted, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r55", userId: "u7", eventId: "e7", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r56", userId: "u7", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // Isabella Taylor - mostly good
        { id: "r57", userId: "u8", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r58", userId: "u8", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r59", userId: "u8", eventId: "e3", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-09T14:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r60", userId: "u8", eventId: "e4", status: AttendanceStatus.Declined, paymentStatus: null, declineNote: "Doctor appointment", updatedAt: "2024-11-11T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r61", userId: "u8", eventId: "e5", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r62", userId: "u8", eventId: "e6", status: AttendanceStatus.Accepted, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r63", userId: "u8", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r64", userId: "u8", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // Daniel Anderson - perfect attendance
        { id: "r65", userId: "u9", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r66", userId: "u9", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r67", userId: "u9", eventId: "e3", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-09T14:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r68", userId: "u9", eventId: "e4", status: AttendanceStatus.Attended, paymentStatus: null, declineNote: null, updatedAt: "2024-11-12T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r69", userId: "u9", eventId: "e5", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r70", userId: "u9", eventId: "e6", status: AttendanceStatus.Accepted, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r71", userId: "u9", eventId: "e7", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r72", userId: "u9", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },

        // Olivia Thomas - good attendance, some invited only
        { id: "r73", userId: "u10", eventId: "e1", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-05T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r74", userId: "u10", eventId: "e2", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-07T21:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r75", userId: "u10", eventId: "e3", status: AttendanceStatus.Attended, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-09T14:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r76", userId: "u10", eventId: "e4", status: AttendanceStatus.Attended, paymentStatus: null, declineNote: null, updatedAt: "2024-11-12T20:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r77", userId: "u10", eventId: "e5", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-13T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r78", userId: "u10", eventId: "e6", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-14T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r79", userId: "u10", eventId: "e7", status: AttendanceStatus.Invited, paymentStatus: null, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
        { id: "r80", userId: "u10", eventId: "e8", status: AttendanceStatus.Accepted, paymentStatus: PaymentStatus.Paid, declineNote: null, updatedAt: "2024-11-15T10:00:00Z", updatedByUserId: null, updatedByUserName: null },
    ],
};
