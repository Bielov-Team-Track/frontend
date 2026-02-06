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
import { ContextSelection } from "../components/ContextSelector";
import { getSavedDraft, clearSavedDraft } from "./useFormPersistence";

export function useEventForm(event?: Event, contextSelection?: ContextSelection, onSuccess?: () => void) {
	const router = useRouter();

	const savedDraft = !event ? getSavedDraft() : null;

	const form = useForm<EventFormData>({
		resolver: yupResolver(eventValidationSchema) as any,
		mode: "onBlur",
		reValidateMode: "onChange",
		defaultValues: event
			? {
					...getDefaultFormValues(),
					name: event.name,
					startTime: event.startTime,
					endTime: event.endTime,
					// Add other event fields as needed
				}
			: savedDraft?.values ?? getDefaultFormValues(),
	});

	const mutation = useMutation({
		mutationFn: async (eventData: EventFormData) => {
			// Check if this is a recurring event series or a single event
			if (eventData.isRecurring) {
				const seriesPayload = transformFormDataToCreateEventSeries(eventData, contextSelection);
				return await createEventSeries(seriesPayload);
			} else {
				const payload = transformFormDataToCreateEvent(eventData, contextSelection);
				return await createEvent(payload);
			}
		},
		onSuccess: (result) => {
			clearSavedDraft();
			// Call the onSuccess callback if provided (e.g., to close modal first)
			if (onSuccess) {
				onSuccess();
			} else {
				// Default: navigate to the event detail page if available
				const eventId = result?.id;
				if (eventId) {
					router.push(`/dashboard/events/${eventId}`);
				} else {
					router.push("/dashboard/events");
				}
				router.refresh();
			}
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
