import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createEvent, createEventSeries } from "@/lib/api/events";
import { Event } from "@/lib/models/Event";
import {
	eventValidationSchema,
	EventFormData,
} from "../validation/eventValidationSchema";
import {
	transformFormDataToCreateEvent,
	transformFormDataToCreateEventSeries,
	getDefaultFormValues,
} from "../utils/eventFormUtils";

export function useEventForm(event?: Event) {
	const router = useRouter();

	const form = useForm<EventFormData>({
		resolver: yupResolver(eventValidationSchema),
		defaultValues: event
			? {
					...getDefaultFormValues(),
					name: event.name,
					startTime: event.startTime,
					endTime: event.endTime,
					// Add other event fields as needed
				}
			: getDefaultFormValues(),
	});

	const mutation = useMutation({
		mutationFn: async (eventData: EventFormData) => {
			// Check if this is a recurring event series or a single event
			if (eventData.isRecurring) {
				const seriesPayload = transformFormDataToCreateEventSeries(eventData);
				return await createEventSeries(seriesPayload);
			} else {
				const payload = transformFormDataToCreateEvent(eventData);
				return await createEvent(payload);
			}
		},
		onSuccess: (result) => {
			// Navigate to the appropriate page
			// For series, we might want to show a success message with event count
			router.push("/dashboard/events/my");
		},
		onError: (error) => {
			console.error("Failed to create event:", error);
		},
	});

	const saveEvent = (data: EventFormData) => {
		mutation.mutate(data);
	};

	return {
		...form,
		saveEvent,
		isPending: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
		isRecurringSeries: form.watch("isRecurring"),
	};
}
