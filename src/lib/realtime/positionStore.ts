import { create } from "zustand";
import { Position } from "@/lib/models/Position";

type PositionState = {
  positions: Record<string, Position>;
  connectionStatus:
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting";
  setPositions: (positions: Position[]) => void;
  setConnectionStatus: (
    status: "disconnected" | "connecting" | "connected" | "reconnecting"
  ) => void;
  applyTaken: (positionId: string, userId: string) => void;
  applyReleased: (positionId: string) => void;
  applyTakenWithRollback: (positionId: string, userId: string) => () => void;
  upsert: (position: Position) => void;
  reset: () => void;
};

export const usePositionStore = create<PositionState>((set, get) => ({
  positions: {},
  connectionStatus: "disconnected",
  setPositions: (positions) =>
    set(() => ({
      positions: positions.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, Position>),
    })),
  setConnectionStatus: (status) => set(() => ({ connectionStatus: status })),
  upsert: (position) =>
    set((s) => ({ positions: { ...s.positions, [position.id]: position } })),
  applyTaken: (positionId, userId) =>
    set((s) => {
      const p = s.positions[positionId];
      if (!p) return {};
      return {
        positions: {
          ...s.positions,
          [positionId]: {
            ...p,
            userProfile: {
              ...(p.userProfile || ({} as any)),
              id: userId,
            } as any,
          },
        },
      };
    }),
  applyReleased: (positionId) =>
    set((s) => {
      const p = s.positions[positionId];
      if (!p) return {};
      return {
        positions: {
          ...s.positions,
          [positionId]: { ...p, userProfile: undefined },
        },
      };
    }),
  applyTakenWithRollback: (positionId, userId) => {
    const previousState = get().positions[positionId];

    // Apply optimistic update
    set((s) => {
      const p = s.positions[positionId];
      if (!p) return {};
      return {
        positions: {
          ...s.positions,
          [positionId]: {
            ...p,
            userProfile: {
              ...(p.userProfile || ({} as any)),
              id: userId,
            } as any,
          },
        },
      };
    });

    // Return rollback function
    return () => {
      set((s) => ({
        positions: {
          ...s.positions,
          [positionId]: previousState,
        },
      }));
    };
  },
  reset: () => set(() => ({ positions: {}, connectionStatus: "disconnected" })),
}));
