"use client";

import { useEffect, useRef } from "react";

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

interface ReactionPickerProps {
	onSelect: (emoji: string) => void;
	onClose: () => void;
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	return (
		<div
			ref={pickerRef}
			className="absolute bottom-full mb-2 bg-base-200 rounded-lg shadow-lg p-2 flex gap-1 z-50"
		>
			{COMMON_EMOJIS.map((emoji) => (
				<button
					key={emoji}
					onClick={() => {
						onSelect(emoji);
						onClose();
					}}
					className="hover:bg-base-300 p-1 rounded text-xl transition-colors"
				>
					{emoji}
				</button>
			))}
		</div>
	);
}

export default ReactionPicker;
