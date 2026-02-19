import { create } from "zustand";
import {
	EvaluationSessionStatus,
	PlayerExerciseScoreDto,
	SessionProgressDto,
} from "@/lib/models/Evaluation";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

type EvaluationSessionState = {
	sessionProgress: SessionProgressDto | null;
	exerciseScores: Record<string, PlayerExerciseScoreDto>;
	connectionStatus: ConnectionStatus;
	sessionStatus: EvaluationSessionStatus | null;

	setSessionProgress: (progress: SessionProgressDto) => void;
	setConnectionStatus: (status: ConnectionStatus) => void;
	setSessionStatus: (status: EvaluationSessionStatus) => void;
	applyScoresSubmitted: (score: PlayerExerciseScoreDto) => void;
	applySessionStatusChanged: (status: EvaluationSessionStatus) => void;
	reset: () => void;
};

export const useEvaluationSessionStore = create<EvaluationSessionState>((set) => ({
	sessionProgress: null,
	exerciseScores: {},
	connectionStatus: "disconnected",
	sessionStatus: null,

	setSessionProgress: (progress) =>
		set({ sessionProgress: progress, sessionStatus: progress.status }),

	setConnectionStatus: (status) => set({ connectionStatus: status }),

	setSessionStatus: (status) => set({ sessionStatus: status }),

	applyScoresSubmitted: (score) =>
		set((s) => ({
			exerciseScores: {
				...s.exerciseScores,
				[`${score.playerId}_${score.exerciseId}`]: score,
			},
		})),

	applySessionStatusChanged: (status) =>
		set({ sessionStatus: status }),

	reset: () =>
		set({
			sessionProgress: null,
			exerciseScores: {},
			connectionStatus: "disconnected",
			sessionStatus: null,
		}),
}));
