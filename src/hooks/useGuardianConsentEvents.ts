import { useEffect } from "react";
import signalRManager from "@/lib/realtime/signalrClient";
import { PROFILES_API_URL } from "@/lib/constants";

interface GuardianConsentGrantedPayload {
	minorUserId: string;
	guardianName: string;
}

interface UseGuardianConsentEventsOptions {
	/** Access token for authentication */
	token?: string;
	/** Callback when guardian consent is granted */
	onConsentGranted?: (payload: GuardianConsentGrantedPayload) => void;
	/** Enable/disable the connection (default: true) */
	enabled?: boolean;
}

/**
 * Hook to subscribe to guardian consent SignalR events from profiles-service.
 *
 * Listens for "GuardianConsentGranted" events when a guardian grants consent for a minor.
 *
 * @example
 * ```tsx
 * useGuardianConsentEvents({
 *   token: accessToken,
 *   onConsentGranted: async ({ minorUserId, guardianName }) => {
 *     // Verify with database before navigating
 *     const status = await getGuardianStatus();
 *     if (status.hasRequiredConsent) {
 *       router.push('/next-step');
 *     }
 *   }
 * });
 * ```
 */
export function useGuardianConsentEvents(
	options: UseGuardianConsentEventsOptions
) {
	const { token, onConsentGranted, enabled = true } = options;

	useEffect(() => {
		if (!enabled || !token) {
			return;
		}

		let mounted = true;

		const setupConnection = async () => {
			try {
				const connection = await signalRManager.start({
					baseUrl: PROFILES_API_URL,
					hub: "profiles",
					token,
				});

				if (!mounted) {
					return;
				}

				// Subscribe to GuardianConsentGranted event
				connection.on(
					"GuardianConsentGranted",
					(payload: GuardianConsentGrantedPayload) => {
						if (onConsentGranted) {
							onConsentGranted(payload);
						}
					}
				);
			} catch (error) {
				console.error("[useGuardianConsentEvents] Failed to connect:", error);
			}
		};

		setupConnection();

		return () => {
			mounted = false;

			// Clean up event listeners when unmounting
			const connection = signalRManager.getConnection(
				PROFILES_API_URL,
				"profiles"
			);
			if (connection) {
				connection.off("GuardianConsentGranted");
			}
		};
	}, [token, onConsentGranted, enabled]);
}
