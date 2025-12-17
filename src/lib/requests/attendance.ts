import client from "../client";
import {
    AttendanceMatrix,
    AttendanceFilter,
    AttendanceRecord,
    UpdateAttendanceRequest,
} from "../models/Attendance";
import { getParamsFromObject } from "../utils/request";

const PREFIX = "/events";

export async function getAttendanceMatrix(
    filter: AttendanceFilter
): Promise<AttendanceMatrix> {
    const endpoint = "/v1/attendance";
    const params = getParamsFromObject(filter);
    return (
        await client.get<AttendanceMatrix>(PREFIX + endpoint, { params })
    ).data;
}

export async function updateAttendance(
    eventId: string,
    userId: string,
    data: UpdateAttendanceRequest
): Promise<AttendanceRecord> {
    const endpoint = `/v1/attendance/${eventId}/users/${userId}`;
    return (
        await client.patch<AttendanceRecord>(PREFIX + endpoint, data)
    ).data;
}

export async function getAttendance(
    eventId: string,
    userId: string
): Promise<AttendanceRecord | null> {
    const endpoint = `/v1/attendance/${eventId}/users/${userId}`;
    try {
        return (await client.get<AttendanceRecord>(PREFIX + endpoint)).data;
    } catch {
        return null;
    }
}
