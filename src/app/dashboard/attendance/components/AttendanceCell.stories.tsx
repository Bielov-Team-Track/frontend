import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AttendanceCell from "./AttendanceCell";
import { AttendanceStatus, PaymentStatus } from "@/lib/models/Attendance";
import { fn } from "storybook/test";

const meta: Meta<typeof AttendanceCell> = {
    title: "Dashboard/Attendance/AttendanceCell",
    component: AttendanceCell,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "dark",
            values: [{ name: "dark", value: "#0a0a0f" }],
        },
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="p-8 bg-background-light rounded-xl">
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseEvent = {
    id: "e1",
    name: "Practice",
    date: "2024-11-05T18:00:00Z",
    isFree: false,
};

export const Invited: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Invited,
            paymentStatus: null,
            declineNote: null,
            updatedAt: "2024-11-05T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        onClick: fn(),
    },
};

export const Accepted: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Accepted,
            paymentStatus: PaymentStatus.Paid,
            declineNote: null,
            updatedAt: "2024-11-05T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        onClick: fn(),
    },
};

export const AcceptedUnpaid: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Accepted,
            paymentStatus: PaymentStatus.Unpaid,
            declineNote: null,
            updatedAt: "2024-11-05T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        onClick: fn(),
    },
};

export const Declined: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Declined,
            paymentStatus: null,
            declineNote: "Family event",
            updatedAt: "2024-11-05T10:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        onClick: fn(),
    },
};

export const Attended: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Attended,
            paymentStatus: PaymentStatus.Paid,
            declineNote: null,
            updatedAt: "2024-11-05T20:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        onClick: fn(),
    },
};

export const AttendedUnpaid: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Attended,
            paymentStatus: PaymentStatus.Unpaid,
            declineNote: null,
            updatedAt: "2024-11-05T20:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: baseEvent,
        onClick: fn(),
    },
};

export const NoShow: Story = {
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
            updatedByUserName: "Admin",
        },
        event: baseEvent,
        onClick: fn(),
    },
};

export const FreeEventAttended: Story = {
    args: {
        record: {
            id: "r1",
            userId: "u1",
            eventId: "e1",
            status: AttendanceStatus.Attended,
            paymentStatus: null,
            declineNote: null,
            updatedAt: "2024-11-05T20:00:00Z",
            updatedByUserId: null,
            updatedByUserName: null,
        },
        event: { ...baseEvent, isFree: true },
        onClick: fn(),
    },
};

export const NoRecord: Story = {
    args: {
        record: null,
        event: baseEvent,
        onClick: fn(),
    },
};

// Gallery of all states
export const AllStates: Story = {
    render: () => (
        <div className="flex flex-col gap-4">
            <div className="text-muted text-sm mb-2">Status Legend:</div>
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                    <AttendanceCell
                        record={null}
                        event={baseEvent}
                        onClick={() => {}}
                    />
                    <span className="text-xs text-muted">Invited</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <AttendanceCell
                        record={{
                            id: "r1",
                            userId: "u1",
                            eventId: "e1",
                            status: AttendanceStatus.Accepted,
                            paymentStatus: PaymentStatus.Paid,
                            declineNote: null,
                            updatedAt: "",
                            updatedByUserId: null,
                            updatedByUserName: null,
                        }}
                        event={baseEvent}
                        onClick={() => {}}
                    />
                    <span className="text-xs text-muted">Accepted (Paid)</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <AttendanceCell
                        record={{
                            id: "r1",
                            userId: "u1",
                            eventId: "e1",
                            status: AttendanceStatus.Accepted,
                            paymentStatus: PaymentStatus.Unpaid,
                            declineNote: null,
                            updatedAt: "",
                            updatedByUserId: null,
                            updatedByUserName: null,
                        }}
                        event={baseEvent}
                        onClick={() => {}}
                    />
                    <span className="text-xs text-muted">Accepted (Unpaid)</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <AttendanceCell
                        record={{
                            id: "r1",
                            userId: "u1",
                            eventId: "e1",
                            status: AttendanceStatus.Declined,
                            paymentStatus: null,
                            declineNote: null,
                            updatedAt: "",
                            updatedByUserId: null,
                            updatedByUserName: null,
                        }}
                        event={baseEvent}
                        onClick={() => {}}
                    />
                    <span className="text-xs text-muted">Declined</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <AttendanceCell
                        record={{
                            id: "r1",
                            userId: "u1",
                            eventId: "e1",
                            status: AttendanceStatus.Attended,
                            paymentStatus: PaymentStatus.Paid,
                            declineNote: null,
                            updatedAt: "",
                            updatedByUserId: null,
                            updatedByUserName: null,
                        }}
                        event={baseEvent}
                        onClick={() => {}}
                    />
                    <span className="text-xs text-muted">Attended (Paid)</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <AttendanceCell
                        record={{
                            id: "r1",
                            userId: "u1",
                            eventId: "e1",
                            status: AttendanceStatus.NoShow,
                            paymentStatus: PaymentStatus.Unpaid,
                            declineNote: null,
                            updatedAt: "",
                            updatedByUserId: null,
                            updatedByUserName: null,
                        }}
                        event={baseEvent}
                        onClick={() => {}}
                    />
                    <span className="text-xs text-muted">No-show</span>
                </div>
            </div>
        </div>
    ),
};
