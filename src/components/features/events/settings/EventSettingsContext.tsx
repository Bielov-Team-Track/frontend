"use client";

import { Event } from "@/lib/models/Event";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface EventSettingsFormData {
	// General
	name: string;
	description: string;
	type: string;
	surface: string;
	isPrivate: boolean;

	// Date & Time
	startTime: Date;
	endTime: Date;

	// Location
	location: {
		name: string;
		address: string;
		city?: string;
		country?: string;
		postalCode?: string;
		latitude?: number;
		longitude?: number;
	};

	// Registration
	registrationType: "open" | "closed";
	capacity?: number;
	registrationDeadline?: Date;
	registrationOpenTime?: Date;

	// Budget
	useBudget: boolean;
	budget?: {
		pricingModel?: string;
		cost?: number;
		payToJoin?: boolean;
		dropoutDeadlineHours?: number;
	};
}

interface EventSettingsContextType {
	formData: EventSettingsFormData;
	updateField: <K extends keyof EventSettingsFormData>(
		field: K,
		value: EventSettingsFormData[K]
	) => void;
	updateNestedField: <
		K extends keyof EventSettingsFormData,
		NK extends keyof NonNullable<EventSettingsFormData[K]>
	>(
		field: K,
		nestedField: NK,
		value: NonNullable<EventSettingsFormData[K]>[NK]
	) => void;
	hasChanges: boolean;
	isSubmitting: boolean;
	setIsSubmitting: (value: boolean) => void;
	resetChanges: () => void;
}

const EventSettingsContext = createContext<EventSettingsContextType | undefined>(undefined);

function eventToFormData(event: Event): EventSettingsFormData {
	return {
		name: event.name,
		description: event.description || "",
		type: event.type,
		surface: event.surface,
		isPrivate: event.isPrivate,
		startTime: new Date(event.startTime),
		endTime: new Date(event.endTime),
		location: {
			name: event.location?.name || "",
			address: event.location?.address || "",
			city: event.location?.city,
			country: event.location?.country,
			postalCode: event.location?.postalCode,
			latitude: event.location?.latitude,
			longitude: event.location?.longitude,
		},
		registrationType: "open", // TODO: Get from event when available
		capacity: undefined, // TODO: Get from event when available
		registrationDeadline: undefined,
		registrationOpenTime: undefined,
		useBudget: !!event.budget,
		budget: event.budget
			? {
					pricingModel: event.budget.pricingModel,
					cost: event.budget.cost,
					payToJoin: event.budget.payToJoin,
					dropoutDeadlineHours: event.budget.dropoutDeadlineHours,
				}
			: undefined,
	};
}

interface EventSettingsProviderProps {
	children: ReactNode;
	event: Event;
}

export function EventSettingsProvider({ children, event }: EventSettingsProviderProps) {
	const [formData, setFormData] = useState<EventSettingsFormData>(() => eventToFormData(event));
	const [originalData, setOriginalData] = useState<EventSettingsFormData>(() => eventToFormData(event));
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Sync form data with event prop when it changes (e.g., after save)
	useEffect(() => {
		const newData = eventToFormData(event);
		setFormData(newData);
		setOriginalData(newData);
	}, [event.updatedAt]);

	const updateField = <K extends keyof EventSettingsFormData>(
		field: K,
		value: EventSettingsFormData[K]
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const updateNestedField = <
		K extends keyof EventSettingsFormData,
		NK extends keyof NonNullable<EventSettingsFormData[K]>
	>(
		field: K,
		nestedField: NK,
		value: NonNullable<EventSettingsFormData[K]>[NK]
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: {
				...(prev[field] as object),
				[nestedField]: value,
			},
		}));
	};

	const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

	const resetChanges = () => {
		setFormData(originalData);
	};

	return (
		<EventSettingsContext.Provider
			value={{
				formData,
				updateField,
				updateNestedField,
				hasChanges,
				isSubmitting,
				setIsSubmitting,
				resetChanges,
			}}
		>
			{children}
		</EventSettingsContext.Provider>
	);
}

export function useEventSettingsContext() {
	const context = useContext(EventSettingsContext);
	if (!context) {
		throw new Error("useEventSettingsContext must be used within EventSettingsProvider");
	}
	return context;
}

export type { EventSettingsFormData };
