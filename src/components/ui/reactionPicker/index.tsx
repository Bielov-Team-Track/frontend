"use client";

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

interface ReactionPickerProps {
	onSelect: (emoji: string) => void;
	onClose: () => void;
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
	return (
		<div className="absolute bottom-full mb-2 bg-base-200 rounded-lg shadow-lg p-2 flex gap-1">
			{COMMON_EMOJIS.map((emoji) => (
				<button
					key={emoji}
					onClick={() => {
						onSelect(emoji);
						onClose();
					}}
					className="hover:bg-base-300 p-1 rounded text-xl">
					{emoji}
				</button>
			))}
		</div>
	);
}
