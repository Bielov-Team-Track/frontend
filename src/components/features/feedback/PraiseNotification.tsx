"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { BadgeDisplay, type BadgeType } from "./BadgeDisplay";
import { firePraiseConfetti } from "./Confetti";
import { cn } from "@/lib/utils";

interface PraiseNotificationProps {
	isOpen: boolean;
	onClose: () => void;
	badgeType: BadgeType;
	message: string;
	coachName: string;
	autoCloseDelay?: number;
}

/**
 * Animated modal notification for displaying praise from coaches
 *
 * Features:
 * - Spring animations for entrance/exit
 * - Auto-close after configurable delay
 * - Confetti animation on show
 * - Badge display with coach message
 *
 * @example
 * ```tsx
 * const [showPraise, setShowPraise] = useState(false);
 *
 * <PraiseNotification
 *   isOpen={showPraise}
 *   onClose={() => setShowPraise(false)}
 *   badgeType="MVP"
 *   message="Outstanding performance today! Your serves were on fire!"
 *   coachName="Coach Sarah"
 *   autoCloseDelay={5000}
 * />
 * ```
 */
export function PraiseNotification({
	isOpen,
	onClose,
	badgeType,
	message,
	coachName,
	autoCloseDelay = 5000,
}: PraiseNotificationProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			// Fire confetti when notification appears
			firePraiseConfetti();

			// Auto-close after delay
			if (autoCloseDelay > 0) {
				const timer = setTimeout(() => {
					handleClose();
				}, autoCloseDelay);

				return () => clearTimeout(timer);
			}
		}
	}, [isOpen, autoCloseDelay]);

	const handleClose = () => {
		setIsVisible(false);
		// Wait for exit animation before calling onClose
		setTimeout(onClose, 300);
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleClose}
						className="fixed inset-0 bg-overlay backdrop-blur-sm z-[9998]"
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
						<motion.div
							initial={{ scale: 0.8, opacity: 0, y: 20 }}
							animate={{
								scale: 1,
								opacity: 1,
								y: 0,
								transition: {
									type: "spring",
									damping: 15,
									stiffness: 300,
								},
							}}
							exit={{
								scale: 0.8,
								opacity: 0,
								y: 20,
								transition: { duration: 0.2 },
							}}
							className={cn(
								"relative w-full max-w-md",
								"bg-gradient-to-br from-card to-card/80",
								"border-2 border-border",
								"rounded-2xl shadow-2xl",
								"p-6"
							)}
						>
							{/* Close button */}
							<button
								onClick={handleClose}
								className={cn(
									"absolute top-4 right-4",
									"w-8 h-8 rounded-full",
									"bg-surface hover:bg-hover",
									"flex items-center justify-center",
									"text-muted-foreground hover:text-foreground",
									"transition-all duration-200"
								)}
								aria-label="Close"
							>
								<X size={18} />
							</button>

							{/* Content */}
							<div className="flex flex-col items-center text-center space-y-4">
								{/* Animated Badge */}
								<motion.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{
										scale: 1,
										rotate: 0,
										transition: {
											type: "spring",
											damping: 10,
											stiffness: 200,
											delay: 0.2,
										},
									}}
								>
									<BadgeDisplay badgeType={badgeType} size="lg" showTooltip={false} />
								</motion.div>

								{/* Praise Title */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{
										opacity: 1,
										y: 0,
										transition: { delay: 0.3 },
									}}
								>
									<h2 className="text-2xl font-bold text-foreground">Praise Received!</h2>
								</motion.div>

								{/* Message */}
								<motion.p
									initial={{ opacity: 0, y: 10 }}
									animate={{
										opacity: 1,
										y: 0,
										transition: { delay: 0.4 },
									}}
									className="text-base text-muted-foreground leading-relaxed max-w-sm"
								>
									{message}
								</motion.p>

								{/* Coach attribution */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{
										opacity: 1,
										y: 0,
										transition: { delay: 0.5 },
									}}
									className={cn(
										"flex items-center gap-2",
										"px-4 py-2 rounded-full",
										"bg-surface border border-border"
									)}
								>
									<span className="text-sm text-muted-foreground">from</span>
									<span className="text-sm font-semibold text-foreground">{coachName}</span>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}

export default PraiseNotification;
