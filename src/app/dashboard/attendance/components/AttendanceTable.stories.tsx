import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AttendanceTable from "./AttendanceTable";
import { mockAttendanceData } from "../mockData";
import { AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { fn } from "storybook/test";

const meta: Meta<typeof AttendanceTable> = {
    title: "Dashboard/Attendance/AttendanceTable",
    component: AttendanceTable,
    parameters: {
        layout: "padded",
        backgrounds: {
            default: "dark",
            values: [{ name: "dark", value: "#0a0a0f" }],
        },
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="bg-background-light rounded-xl p-4 max-w-6xl">
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        data: mockAttendanceData,
        onUpdateAttendance: fn(),
    },
};

export const FewEvents: Story = {
    args: {
        data: {
            ...mockAttendanceData,
            events: mockAttendanceData.events.slice(0, 3),
            records: mockAttendanceData.records.filter((r) =>
                ["e1", "e2", "e3"].includes(r.eventId)
            ),
        },
        onUpdateAttendance: fn(),
    },
};

export const FewMembers: Story = {
    args: {
        data: {
            ...mockAttendanceData,
            members: mockAttendanceData.members.slice(0, 3),
            records: mockAttendanceData.records.filter((r) =>
                ["u1", "u2", "u3"].includes(r.userId)
            ),
        },
        onUpdateAttendance: fn(),
    },
};

export const EmptyState: Story = {
    args: {
        data: {
            events: [],
            members: [],
            records: [],
        },
        onUpdateAttendance: fn(),
    },
};

export const AllPaid: Story = {
    args: {
        data: {
            events: mockAttendanceData.events.map((e) => ({ ...e, isFree: false })),
            members: mockAttendanceData.members.slice(0, 5),
            records: mockAttendanceData.records
                .filter((r) => ["u1", "u2", "u3", "u4", "u5"].includes(r.userId))
                .map((r) => ({
                    ...r,
                    status: AttendanceStatus.Attended,
                    paymentStatus: PaymentStatus.Paid,
                })),
        },
        onUpdateAttendance: fn(),
    },
};

export const AllUnpaid: Story = {
    args: {
        data: {
            events: mockAttendanceData.events.map((e) => ({ ...e, isFree: false })),
            members: mockAttendanceData.members.slice(0, 5),
            records: mockAttendanceData.records
                .filter((r) => ["u1", "u2", "u3", "u4", "u5"].includes(r.userId))
                .map((r) => ({
                    ...r,
                    status: AttendanceStatus.Attended,
                    paymentStatus: PaymentStatus.Unpaid,
                })),
        },
        onUpdateAttendance: fn(),
    },
};

export const ManyWarnings: Story = {
    args: {
        data: {
            ...mockAttendanceData,
            members: mockAttendanceData.members.map((m) => ({
                ...m,
                highlightWarning: true,
                declineStreak: 3,
            })),
        },
        onUpdateAttendance: fn(),
    },
};

export const AllFreeEvents: Story = {
    args: {
        data: {
            events: mockAttendanceData.events.map((e) => ({ ...e, isFree: true })),
            members: mockAttendanceData.members.slice(0, 5),
            records: mockAttendanceData.records
                .filter((r) => ["u1", "u2", "u3", "u4", "u5"].includes(r.userId))
                .map((r) => ({
                    ...r,
                    paymentStatus: null,
                })),
        },
        onUpdateAttendance: fn(),
    },
};
