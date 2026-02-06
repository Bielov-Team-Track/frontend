"use client";

import { useEffect, useRef } from "react";

interface ConfettiProps {
	trigger: boolean;
	onComplete?: () => void;
}

/**
 * Confetti component that triggers confetti animation when `trigger` prop changes to true
 *
 * @example
 * ```tsx
 * const [showConfetti, setShowConfetti] = useState(false);
 *
 * <Confetti
 *   trigger={showConfetti}
 *   onComplete={() => setShowConfetti(false)}
 * />
 * ```
 */
export function Confetti({ trigger, onComplete }: ConfettiProps) {
	const hasTriggered = useRef(false);

	useEffect(() => {
		if (trigger && !hasTriggered.current) {
			hasTriggered.current = true;
			firePraiseConfetti();

			// Reset trigger after animation
			const timeout = setTimeout(() => {
				hasTriggered.current = false;
				onComplete?.();
			}, 3000);

			return () => clearTimeout(timeout);
		}
	}, [trigger, onComplete]);

	return null;
}

/**
 * Programmatically fires a praise-themed confetti animation
 *
 * NOTE: Requires canvas-confetti package to be installed:
 * npm install canvas-confetti @types/canvas-confetti
 *
 * @example
 * ```tsx
 * import { firePraiseConfetti } from '@/components/features/feedback/Confetti';
 *
 * function handlePraise() {
 *   firePraiseConfetti();
 * }
 * ```
 */
export function firePraiseConfetti() {
	if (typeof window === "undefined") return;

	// Check if canvas-confetti is available
	// When installed, use: import confetti from 'canvas-confetti';
	// For now, log a message indicating it needs to be installed
	console.warn(
		"canvas-confetti is not installed. Install it with: npm install canvas-confetti @types/canvas-confetti"
	);

	// Uncomment when canvas-confetti is installed:
	/*
	import('canvas-confetti').then((confetti) => {
		const count = 200;
		const defaults = {
			origin: { y: 0.7 },
			zIndex: 9999,
		};

		function fire(particleRatio: number, opts: confetti.Options) {
			confetti.default({
				...defaults,
				...opts,
				particleCount: Math.floor(count * particleRatio),
			});
		}

		// Burst pattern with gold/yellow colors for praise
		fire(0.25, {
			spread: 26,
			startVelocity: 55,
			colors: ['#FFD700', '#FFA500', '#FF8C00'],
		});

		fire(0.2, {
			spread: 60,
			colors: ['#FFD700', '#FFA500', '#FFFF00'],
		});

		fire(0.35, {
			spread: 100,
			decay: 0.91,
			scalar: 0.8,
			colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00'],
		});

		fire(0.1, {
			spread: 120,
			startVelocity: 25,
			decay: 0.92,
			scalar: 1.2,
			colors: ['#FFD700', '#FFA500'],
		});

		fire(0.1, {
			spread: 120,
			startVelocity: 45,
			colors: ['#FFD700', '#FFFF00'],
		});
	});
	*/
}
