import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/api/events";
import { Event } from "@/lib/models/Event";
import {
	eventValidationSchema,
	EventFormData,
} from "../validation/eventValidationSchema";
import {
	transformFormDataToCreateEvent,
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
			const payload = transformFormDataToCreateEvent(eventData);
			return await createEvent(payload);
		},
		onSuccess: () => {
			router.push("/dashboard/events/my");
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
	};
}
