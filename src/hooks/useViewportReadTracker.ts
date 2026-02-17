"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePageVisibility } from "./usePageVisibility";

interface UseViewportReadTrackerOptions {
	chatId: string;
	currentUserId: string;
	messages: Array<{ id: string; senderId: string; sentAt: string }>;
	onMarkAsRead: (lastReadMessageId: string) => void;
	enabled?: boolean;
}

interface UseViewportReadTrackerReturn {
	observeMessage: (messageId: string, element: HTMLElement | null) => void;
}

type Timer = ReturnType<typeof setTimeout>;

const DEBOUNCE_MS = 500;
const INTERSECTION_THRESHOLD = 0.5;

export function useViewportReadTracker({
	chatId,
	currentUserId,
	messages,
	onMarkAsRead,
	enabled = true,
}: UseViewportReadTrackerOptions): UseViewportReadTrackerReturn {
	const isVisible = usePageVisibility();

	const observerRef = useRef<IntersectionObserver | null>(null);
	const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
	const watermarkIndexRef = useRef<number>(-1);
	const flushedIndexRef = useRef<number>(-1);
	const debounceTimerRef = useRef<Timer | undefined>(undefined);
	const messagesRef = useRef(messages);
	const onMarkAsReadRef = useRef(onMarkAsRead);
	const chatIdRef = useRef(chatId);

	// Keep refs in sync
	messagesRef.current = messages;
	onMarkAsReadRef.current = onMarkAsRead;

	// Build messageId -> index map for O(1) lookups
	const indexMapRef = useRef<Map<string, number>>(new Map());
	useEffect(() => {
		const map = new Map<string, number>();
		messages.forEach((msg, i) => {
			map.set(msg.id, i);
		});
		indexMapRef.current = map;
	}, [messages]);

	// Flush pending watermark: call onMarkAsRead with the message at the watermark index
	const flushWatermark = useCallback(() => {
		clearTimeout(debounceTimerRef.current);
		debounceTimerRef.current = undefined;

		const watermark = watermarkIndexRef.current;
		if (watermark < 0 || watermark <= flushedIndexRef.current) return;

		const msg = messagesRef.current[watermark];
		if (!msg) return;

		flushedIndexRef.current = watermark;
		onMarkAsReadRef.current(msg.id);
	}, []);

	// Schedule a debounced flush
	const scheduleDebouncedFlush = useCallback(() => {
		clearTimeout(debounceTimerRef.current);
		debounceTimerRef.current = setTimeout(flushWatermark, DEBOUNCE_MS);
	}, [flushWatermark]);

	// Process an intersecting message: update watermark if higher
	const processVisibleMessage = useCallback(
		(messageId: string) => {
			const index = indexMapRef.current.get(messageId);
			if (index === undefined) return;

			// Only track messages from other users
			const msg = messagesRef.current[index];
			if (!msg || msg.senderId === currentUserId) return;

			if (index > watermarkIndexRef.current) {
				watermarkIndexRef.current = index;
				scheduleDebouncedFlush();
			}
		},
		[currentUserId, scheduleDebouncedFlush],
	);

	// Create/recreate the IntersectionObserver
	useEffect(() => {
		if (!enabled) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (!isVisible) return;

				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const messageId = (entry.target as HTMLElement).dataset.messageId;
					if (messageId) {
						processVisibleMessage(messageId);
					}
				}
			},
			{ threshold: INTERSECTION_THRESHOLD },
		);

		observerRef.current = observer;

		// Re-observe all tracked elements
		elementsRef.current.forEach((element) => {
			observer.observe(element);
		});

		return () => {
			observer.disconnect();
			observerRef.current = null;
		};
	}, [enabled, isVisible, processVisibleMessage]);

	// When page becomes visible again, re-check all observed elements
	useEffect(() => {
		if (!isVisible || !enabled) return;

		// Check all tracked elements against current observer records
		const observer = observerRef.current;
		if (!observer) return;

		// takeRecords gets pending entries, then we manually check
		const pendingEntries = observer.takeRecords();
		for (const entry of pendingEntries) {
			if (!entry.isIntersecting) continue;
			const messageId = (entry.target as HTMLElement).dataset.messageId;
			if (messageId) {
				processVisibleMessage(messageId);
			}
		}

		// Re-observe all elements to trigger fresh intersection checks
		elementsRef.current.forEach((element, messageId) => {
			observer.unobserve(element);
			observer.observe(element);
		});
	}, [isVisible, enabled, processVisibleMessage]);

	// Reset watermark on chat change; flush any pending reads for the old chat
	useEffect(() => {
		if (chatIdRef.current !== chatId) {
			// Flush pending reads for the previous chat before resetting
			flushWatermark();
			chatIdRef.current = chatId;
		}

		watermarkIndexRef.current = -1;
		flushedIndexRef.current = -1;
		elementsRef.current.clear();

		// Disconnect and let the observer effect recreate observation
		observerRef.current?.disconnect();
	}, [chatId, flushWatermark]);

	// Cleanup on unmount: flush any pending reads
	useEffect(() => {
		return () => {
			flushWatermark();
		};
	}, [flushWatermark]);

	// Stable ref callback for observing message elements
	const observeMessage = useCallback(
		(messageId: string, element: HTMLElement | null) => {
			const observer = observerRef.current;

			// Unobserve previous element for this messageId
			const prev = elementsRef.current.get(messageId);
			if (prev) {
				observer?.unobserve(prev);
				elementsRef.current.delete(messageId);
			}

			if (!element) return;

			// Store messageId on the element for retrieval in observer callback
			element.dataset.messageId = messageId;
			elementsRef.current.set(messageId, element);
			observer?.observe(element);
		},
		[],
	);

	return { observeMessage };
}
