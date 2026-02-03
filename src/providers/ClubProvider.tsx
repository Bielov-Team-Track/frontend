"use client";

import { getUserClubs } from "@/lib/api/clubs";
import { Club } from "@/lib/models/Club";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

interface ClubContextType {
	clubs: Club[];
	selectedClub: Club | null;
	isLoading: boolean;
	selectClub: (club: Club) => void;
	refreshClubs: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const SELECTED_CLUB_STORAGE_KEY = "selectedClubId";

export function ClubProvider({ children }: { children: ReactNode }) {
	const { userProfile } = useAuth();
	const [clubs, setClubs] = useState<Club[]>([]);
	const [selectedClub, setSelectedClub] = useState<Club | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const selectClub = useCallback((club: Club) => {
		setSelectedClub(club);
		localStorage.setItem(SELECTED_CLUB_STORAGE_KEY, club.id);
	}, []);

	const refreshClubs = useCallback(async () => {
		if (!userProfile?.id) {
			setClubs([]);
			setSelectedClub(null);
			return;
		}

		setIsLoading(true);
		try {
			const userClubs = await getUserClubs(userProfile.id);
			setClubs(userClubs);

			// Restore selected club or select the first one
			const storedClubId = localStorage.getItem(SELECTED_CLUB_STORAGE_KEY);
			if (storedClubId) {
				const foundClub = userClubs.find((c) => c.id === storedClubId);
				if (foundClub) {
					setSelectedClub(foundClub);
				} else if (userClubs.length > 0) {
					selectClub(userClubs[0]);
				}
			} else if (userClubs.length > 0) {
				selectClub(userClubs[0]);
			}
		} catch (error) {
			console.error("Failed to load clubs:", error);
		} finally {
			setIsLoading(false);
		}
	}, [userProfile?.id]);

	useEffect(() => {
		refreshClubs();
	}, [refreshClubs]);

	const value = useMemo(
		() => ({
			clubs,
			selectedClub,
			isLoading,
			selectClub,
			refreshClubs,
		}),
		[clubs, selectedClub, isLoading, selectClub, refreshClubs]
	);

	return (
		<ClubContext.Provider value={value}>
			{children}
		</ClubContext.Provider>
	);
}

export function useClub(): ClubContextType {
	const context = useContext(ClubContext);
	if (context === undefined) {
		throw new Error("useClub must be used within a ClubProvider");
	}
	return context;
}
