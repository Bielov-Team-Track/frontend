import { useCallback, useEffect, useRef, useState } from "react";

const DRAFT_PREFIX = "volleyer:draft";
const DEBOUNCE_MS = 500;

function buildKey(segments: string[]): string {
	return [DRAFT_PREFIX, ...segments].join(":");
}

/**
 * Persists a draft value to localStorage, scoped by arbitrary key segments.
 *
 * Key examples:
 *   useDraft<PostDraft>(["post", "club", clubId])   → "volleyer:draft:post:club:{id}"
 *   useDraft<string>(["comment", postId])            → "volleyer:draft:comment:{postId}"
 *
 * The draft auto-saves on every change (debounced) and is cleared on discard/submit.
 */
export function useDraft<T>(segments: string[], initialValue: T) {
	const key = buildKey(segments);
	const timerRef = useRef<ReturnType<typeof setTimeout>>();

	const [value, setValue] = useState<T>(() => {
		if (typeof window === "undefined") return initialValue;
		try {
			const stored = localStorage.getItem(key);
			return stored ? (JSON.parse(stored) as T) : initialValue;
		} catch {
			return initialValue;
		}
	});

	const [hasDraft, setHasDraft] = useState(() => {
		if (typeof window === "undefined") return false;
		return localStorage.getItem(key) !== null;
	});

	// Debounced save to localStorage
	useEffect(() => {
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			try {
				const isEmpty = isValueEmpty(value);
				if (isEmpty) {
					localStorage.removeItem(key);
					setHasDraft(false);
				} else {
					localStorage.setItem(key, JSON.stringify(value));
					setHasDraft(true);
				}
			} catch {
				// localStorage full or unavailable — silently ignore
			}
		}, DEBOUNCE_MS);

		return () => clearTimeout(timerRef.current);
	}, [key, value]);

	const clearDraft = useCallback(() => {
		setValue(initialValue);
		localStorage.removeItem(key);
		setHasDraft(false);
	}, [key, initialValue]);

	return { value, setValue, hasDraft, clearDraft } as const;
}

/** Check if the value is "empty" (no meaningful content worth persisting). */
function isValueEmpty(value: unknown): boolean {
	if (value === null || value === undefined || value === "") return true;
	if (typeof value === "string") return value.replace(/<[^>]*>/g, "").trim().length === 0;
	if (typeof value === "object") {
		return Object.values(value as Record<string, unknown>).every(isValueEmpty);
	}
	return false;
}
