"use client";

import EmojiPicker, { Theme } from "emoji-picker-react";
import { Plus } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

export interface ReactionPickerProps {
	onSelect: (emoji: string) => void;
	onClose: () => void;
	triggerRef: React.RefObject<HTMLElement | null>;
	commonEmojis?: string[];
}

export default function ReactionPicker({ 
	onSelect, 
	onClose, 
	triggerRef, 
	commonEmojis = DEFAULT_COMMON_EMOJIS 
}: ReactionPickerProps) {
	const pickerRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [showFullPicker, setShowFullPicker] = useState(false);

	useLayoutEffect(() => {
		if (triggerRef.current && pickerRef.current) {
			const triggerRect = triggerRef.current.getBoundingClientRect();
			const pickerRect = pickerRef.current.getBoundingClientRect();
			
			const gap = 8;
			let top = triggerRect.top - pickerRect.height - gap;
			let left = triggerRect.left;

			// Check top edge - if no space above, flip to bottom
			if (top < 10) {
				top = triggerRect.bottom + gap;
			}
			
			// If still off screen (bottom edge), push it up
			if (top + pickerRect.height > window.innerHeight - 10) {
				top = window.innerHeight - pickerRect.height - 10;
			}

			// Check right edge
			if (left + pickerRect.width > window.innerWidth - 10) {
				left = window.innerWidth - pickerRect.width - 10;
			}

			// Check left edge
			if (left < 10) {
				left = 10;
			}

			setPosition({ top, left });
			setIsVisible(true);
		}
	}, [triggerRef, showFullPicker]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current && 
				!pickerRef.current.contains(event.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		const handleScroll = () => {
			// Optional: Close on scroll if desired
		};

		document.addEventListener("mousedown", handleClickOutside);
		window.addEventListener("scroll", handleScroll, true);
		window.addEventListener("resize", onClose);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			window.removeEventListener("scroll", handleScroll, true);
			window.removeEventListener("resize", onClose);
		};
	}, [onClose, triggerRef]);

	if (typeof document === 'undefined') return null;

	return createPortal(
		<div
			ref={pickerRef}
			style={{ 
				top: position.top, 
				left: position.left,
				opacity: isVisible ? 1 : 0,
			}}
			className={`fixed z-9999 bg-background/80 backdrop-blur-md border border-white/10 shadow-2xl transition-opacity duration-200 ${
				showFullPicker ? "rounded-2xl p-0 overflow-hidden" : "rounded-full p-1.5 flex gap-1"
			}`}
		>
			{showFullPicker ? (
				<EmojiPicker 
					onEmojiClick={(data) => {
						onSelect(data.emoji);
						onClose();
					}}
					theme={Theme.DARK}
					lazyLoadEmojis={true}
					width={350}
					height={450}
                    style={{ backgroundColor: "transparent", border: "none" }}
				/>
			) : (
				<>
					{commonEmojis.map((emoji) => (
						<button
							key={emoji}
							onClick={(e) => {
								e.stopPropagation();
								onSelect(emoji);
								onClose();
							}}
							className="hover:bg-white/10 p-2 rounded-full text-xl transition-colors w-10 h-10 flex items-center justify-center leading-none select-none"
						>
							{emoji}
						</button>
					))}
					<div className="w-px h-6 bg-white/10 my-auto mx-1" />
					<button
						onClick={(e) => {
							e.stopPropagation();
							setIsVisible(false); // Briefly hide to prevent jump visual
							setShowFullPicker(true);
						}}
						className="hover:bg-white/10 p-2 rounded-full text-muted-foreground hover:text-white transition-colors w-10 h-10 flex items-center justify-center leading-none"
						title="More emojis"
					>
						<Plus size={20} />
					</button>
				</>
			)}
		</div>,
		document.body
	);
}
