"use client";

import { ContextSelection } from "@/components/features/events/forms/components/ContextSelector";
import Modal from "@/components/ui/modal";
import Loader from "@/components/ui/loader";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { createContext, useCallback, useContext, useState } from "react";

// Lazy load heavy modal content - only loaded when user opens the modal
const CreateEventForm = dynamic(
	() => import("@/components/features/events/forms/CreateEventForm"),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader size="lg" />
			</div>
		),
	}
);

const CreateClubModal = dynamic(
	() => import("@/components/features/wizards/create-club").then((mod) => mod.CreateClubModal),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader size="lg" />
			</div>
		),
	}
);

interface EventContext {
	source?: string;
	clubId?: string;
	teamId?: string;
	groupId?: string;
}

interface CreateModalsContextType {
	// Event modal
	openCreateEvent: (context?: Partial<EventContext>) => void;
	closeCreateEvent: () => void;
	isCreateEventOpen: boolean;

	// Club modal
	openCreateClub: () => void;
	closeCreateClub: () => void;
	isCreateClubOpen: boolean;
}

const CreateModalsContext = createContext<CreateModalsContextType | undefined>(undefined);

export function CreateModalsProvider({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	// Event modal state
	const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
	const [eventContext, setEventContext] = useState<EventContext>({ source: "events" });

	// Club modal state
	const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);

	// Event modal handlers
	const openCreateEvent = useCallback((context?: Partial<EventContext>) => {
		setEventContext({
			source: "events",
			...context,
		});
		setIsCreateEventOpen(true);
	}, []);

	const closeCreateEvent = useCallback(() => {
		setIsCreateEventOpen(false);
	}, []);

	// Handler for successful event creation - close modal first, then navigate
	const handleEventSuccess = useCallback(() => {
		setIsCreateEventOpen(false);
		router.push("/dashboard/events");
	}, [router]);

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

	// Build context selection from eventContext
	const contextSelection: ContextSelection | undefined = eventContext.clubId
		? {
				clubId: eventContext.clubId,
				teamId: eventContext.teamId,
				groupId: eventContext.groupId,
		  }
		: undefined;

	return (
		<CreateModalsContext.Provider value={value}>
			{children}

			{/* Render modals at root level */}
			<Modal isOpen={isCreateEventOpen} onClose={closeCreateEvent} title="Create Event" size="lg">
				<CreateEventForm variant="embedded" contextSelection={contextSelection} onSuccess={handleEventSuccess} />
			</Modal>

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
