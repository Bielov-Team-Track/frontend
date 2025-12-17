import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CellPopover from "./CellPopover";
import { AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { fn } from "storybook/test";

const meta: Meta<typeof CellPopover> = {
    title: "Dashboard/Attendance/CellPopover",
    component: CellPopover,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "dark",
            values: [{ name: "dark", value: "#0a0a0f" }],
        },
    },
    tags: ["autodocs"],
    argTypes: {
        isLoading: { control: "boolean" },
        requireDeclineReason: { control: "boolean" },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseEvent = {
    id: "e1",
    name: "Tuesday Practice",
    date: "2024-11-05T18:00:00Z",
    isFree: false,
};

const baseMember = {
    userId: "u1",
    name: "Alex Johnson",
    avatarUrl: null,
    highlightWarning: false,
    declineStreak: 0,
};

export const NewRecord: Story = {
    args: {
        record: null,
        event: baseEvent,
        member: baseMember,
        onClose: fn(),
        onUpdate: fn(),
        requireDeclineReason: false,
    },
};

export const EditingAccepted: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Accepted,
            paymentStatus: PaymentStatus.Paid,
            declineNote: null,
            updatedAt: "2024-11-04T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        member: baseMember,
        onClose: fn(),
        onUpdate: fn(),
        requireDeclineReason: false,
    },
};

export const EditingDeclined: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Declined,
            paymentStatus: null,
            declineNote: "Family event",
            updatedAt: "2024-11-04T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        member: baseMember,
        onClose: fn(),
        onUpdate: fn(),
        requireDeclineReason: false,
    },
};

export const WithRequiredDeclineReason: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Declined,
            paymentStatus: null,
            declineNote: "",
            updatedAt: "2024-11-04T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        member: baseMember,
        onClose: fn(),
        onUpdate: fn(),
        requireDeclineReason: true,
    },
};

export const FreeEvent: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Accepted,
            paymentStatus: null,
            declineNote: null,
            updatedAt: "2024-11-04T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: { ...baseEvent, isFree: true },
        member: baseMember,
        onClose: fn(),
        onUpdate: fn(),
        requireDeclineReason: false,
    },
};

export const WithUpdateHistory: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.NoShow,
            paymentStatus: PaymentStatus.Unpaid,
            declineNote: null,
            updatedAt: "2024-11-05T20:00:00Z",
            updatedByUserId: "admin1",
            updatedByUserName: "Admin User",
        },
        event: baseEvent,
        member: baseMember,
        onClose: fn(),
        onUpdate: fn(),
        requireDeclineReason: false,
    },
};

export const WarningMember: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u3",
            eventId: "e1",
            status: AttendanceStatus.Declined,
            paymentStatus: null,
            declineNote: "Work conflict",
            updatedAt: "2024-11-04T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        member: {
            userId: "u3",
            name: "James Wilson",
            avatarUrl: null,
            highlightWarning: true,
            declineStreak: 3,
        },
        onClose: fn(),
        onUpdate: fn(),
        requireDeclineReason: false,
    },
};

export const Loading: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Accepted,
            paymentStatus: PaymentStatus.Paid,
            declineNote: null,
            updatedAt: "2024-11-04T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        member: baseMember,
        onClose: fn(),
        onUpdate: fn(),
        isLoading: true,
    },
};
