"use client";

import { Avatar } from "@/components/ui";
import { MentionSuggestion } from "@/lib/models/Mention";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface MentionSuggestionsProps {
	items: MentionSuggestion[];
	command: (item: { id: string; label: string }) => void;
	showEveryone?: boolean;
}

export interface MentionSuggestionsRef {
	onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionSuggestions = forwardRef<MentionSuggestionsRef, MentionSuggestionsProps>(({ items, command, showEveryone = true }, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Add @everyone option at the start if enabled
	const allItems = showEveryone ? [{ userId: "everyone", displayName: "everyone", isEveryone: true } as const, ...items] : items;

	useEffect(() => {
		setSelectedIndex(0);
	}, [items]);

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }) => {
			if (event.key === "ArrowUp") {
				setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
				return true;
			}
			if (event.key === "ArrowDown") {
				setSelectedIndex((prev) => (prev + 1) % allItems.length);
				return true;
			}
			if (event.key === "Enter") {
				const item = allItems[selectedIndex];
				if (item) {
					command({ id: item.userId, label: item.displayName });
				}
				return true;
			}
			return false;
		},
	}));

	if (allItems.length === 0) {
		return (
			<div className="bg-surface-elevated backdrop-blur-lg border border-border rounded-xl shadow-xl p-3">
				<p className="text-sm text-muted-foreground">No users found</p>
			</div>
		);
	}

	return (
		<div className="bg-surface-elevated backdrop-blur-lg border border-border rounded-xl shadow-xl py-1 max-h-64 overflow-y-auto">
			{allItems.map((item, index) => {
				const isEveryone = "isEveryone" in item && item.isEveryone;
				return (
					<button
						key={isEveryone ? "everyone" : item.userId}
						onClick={() => command({ id: item.userId, label: item.displayName })}
						className={cn(
							"w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
							index === selectedIndex ? "bg-active" : "hover:bg-hover"
						)}>
						{isEveryone ? (
							<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
								<Users size={16} className="text-primary" />
							</div>
						) : (
							<Avatar name={item.displayName} src={(item as MentionSuggestion).avatarUrl} variant="user" className="w-8 h-8" />
						)}
						<div>
							<p className="text-sm text-white">{isEveryone ? "@everyone" : item.displayName}</p>
							{isEveryone && <p className="text-xs text-muted-foreground">Notify all members</p>}
						</div>
					</button>
				);
			})}
		</div>
	);
});

MentionSuggestions.displayName = "MentionSuggestions";

export default MentionSuggestions;
