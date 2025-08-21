import { create } from "zustand";
import { EventParticipant } from "../models/EventParticipant";

type PaymentStore = {
  participants: Record<string, EventParticipant>;
  connectionStatus:
    | "disconnected"
    | "connecting"
    | "connected"
    | "reconnecting";
  setParticipants: (participants: EventParticipant[]) => void;
  setConnectionStatus: (
    status: "disconnected" | "connecting" | "connected" | "reconnecting"
  ) => void;
  applyPaymentReceived: (participantId: string) => void;
  upsert: (participant: EventParticipant) => void;
  reset: () => void;
};

export const usePaymentsStore = create<PaymentStore>((set, get) => ({
  participants: {},
  connectionStatus: "disconnected",
  setParticipants: (participants) =>
    set(() => ({
      participants: participants.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, EventParticipant>),
    })),
  setConnectionStatus: (status) => set(() => ({ connectionStatus: status })),
  upsert: (participant) =>
    set((s) => ({
      participants: { ...s.participants, [participant.id]: participant },
    })),
  applyPaymentReceived: (participantId: string) =>
    set((s) => {
      const participant = s.participants[participantId];
      if (!participant) return {};
      return {
        participants: {
          ...s.participants,
          [participantId]: {
            ...participant,
            hasPaid: true,
          },
        },
      };
    }),
  reset: () => set(() => ({ positions: {}, connectionStatus: "disconnected" })),
}));
