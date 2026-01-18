"use client";

import { WizardContext } from "@/components/features/wizards/core/types";
import { CreateClubModal } from "@/components/features/wizards/create-club";
import { CreateEventModal } from "@/components/features/wizards/create-event";
import React, { createContext, useCallback, useContext, useState } from "react";

interface CreateModalsContextType {
	// Event modal
	openCreateEvent: (context?: Partial<WizardContext>) => void;
	closeCreateEvent: () => void;
	isCreateEventOpen: boolean;

	// Club modal
	openCreateClub: () => void;
	closeCreateClub: () => void;
	isCreateClubOpen: boolean;
}

const CreateModalsContext = createContext<CreateModalsContextType | undefined>(undefined);

export function CreateModalsProvider({ children }: { children: React.ReactNode }) {
	// Event modal state
	const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
	const [eventContext, setEventContext] = useState<WizardContext>({ source: "events" });

	// Club modal state
	const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

	// Event modal handlers
	const openCreateEvent = useCallback((context?: Partial<WizardContext>) => {
		setEventContext({
			source: "events",
			...context,
		});
		setIsCreateEventOpen(true);
	}, []);

	const closeCreateEvent = useCallback(() => {
		setIsCreateEventOpen(false);
	}, []);

	// Club modal handlers
	const openCreateClub = useCallback(() => {
		setIsCreateClubOpen(true);
	}, []);

	const closeCreateClub = useCallback(() => {
		setIsCreateClubOpen(false);
	}, []);

	const value: CreateModalsContextType = {
		openCreateEvent,
		closeCreateEvent,
		isCreateEventOpen,
		openCreateClub,
		closeCreateClub,
		isCreateClubOpen,
	};

	return (
		<CreateModalsContext.Provider value={value}>
			{children}

			{/* Render modals at root level */}
			<CreateEventModal isOpen={isCreateEventOpen} onClose={closeCreateEvent} context={eventContext} />

			<CreateClubModal isOpen={isCreateClubOpen} onClose={closeCreateClub} />
		</CreateModalsContext.Provider>
	);
}

export function useCreateModals(): CreateModalsContextType {
	const context = useContext(CreateModalsContext);
	if (!context) {
		throw new Error("useCreateModals must be used within CreateModalsProvider");
	}
	return context;
}
