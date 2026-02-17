import { create } from "zustand";

export type HouseholdRole = "PrimaryGuardian" | "Guardian" | "Minor" | "Adult";

export interface FamilyMember {
	userId: string;
	name?: string;
	role: HouseholdRole;
}

interface FamilyState {
	// Current acting-as state
	actingAsUserId: string | null;
	actingAsName: string | null;

	// Household info
	householdId: string | null;
	members: FamilyMember[];
	isGuardian: boolean;

	// Actions
	setActingAs: (userId: string | null, name?: string | null) => void;
	clearActingAs: () => void;
	setHousehold: (householdId: string | null, members: FamilyMember[]) => void;
	setIsGuardian: (isGuardian: boolean) => void;

	// Helpers
	getActingAsUserId: () => string | null;
	getMinors: () => FamilyMember[];

	reset: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
	actingAsUserId: null,
	actingAsName: null,
	householdId: null,
	members: [],
	isGuardian: false,

	setActingAs: (userId, name = null) =>
		set({ actingAsUserId: userId, actingAsName: name ?? null }),

	clearActingAs: () =>
		set({ actingAsUserId: null, actingAsName: null }),

	setHousehold: (householdId, members) => {
		const isGuardian = members.some(
			(m) => m.role === "PrimaryGuardian" || m.role === "Guardian"
		);
		set({ householdId, members, isGuardian });
	},

	setIsGuardian: (isGuardian) => set({ isGuardian }),

	getActingAsUserId: () => get().actingAsUserId,
	getMinors: () => get().members.filter((m) => m.role === "Minor"),

	reset: () =>
		set({
			actingAsUserId: null,
			actingAsName: null,
			householdId: null,
			members: [],
			isGuardian: false,
		}),
}));
