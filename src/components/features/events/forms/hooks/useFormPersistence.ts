import { useEffect, useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

const STORAGE_KEY = "event-form-draft";
const DEBOUNCE_MS = 1000;

interface PersistedFormState {
	values: Record<string, unknown>;
	currentStep: number;
	savedAt: number;
}

export function useFormPersistence(
	form: UseFormReturn<any>,
	currentStep: number,
) {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const saveState = useCallback(() => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			try {
				const state: PersistedFormState = {
					values: form.getValues(),
					currentStep,
					savedAt: Date.now(),
				};
				sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
			} catch {
				// sessionStorage full or unavailable
			}
		}, DEBOUNCE_MS);
	}, [form, currentStep]);

	useEffect(() => {
		const subscription = form.watch(() => saveState());
		return () => subscription.unsubscribe();
	}, [form, saveState]);

	useEffect(() => {
		saveState();
	}, [currentStep, saveState]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return {
		clearDraft: () => sessionStorage.removeItem(STORAGE_KEY),
	};
}

export function getSavedDraft(): PersistedFormState | null {
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const state: PersistedFormState = JSON.parse(raw);
		if (Date.now() - state.savedAt > 24 * 60 * 60 * 1000) {
			sessionStorage.removeItem(STORAGE_KEY);
			return null;
		}
		return state;
	} catch {
		return null;
	}
}

export function clearSavedDraft() {
	sessionStorage.removeItem(STORAGE_KEY);
}
