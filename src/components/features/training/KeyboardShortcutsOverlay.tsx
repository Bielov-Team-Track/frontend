"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyboardShortcutsOverlayProps {
	isOpen: boolean;
	onClose: () => void;
}

const shortcuts = {
	general: [
		{ key: "Ctrl+S", description: "Save template" },
		{ key: "Ctrl+Z", description: "Undo (future)" },
		{ key: "Ctrl+F", description: "Focus search" },
		{ key: "?", description: "Show keyboard shortcuts" },
	],
	timeline: [
		{ key: "↑", description: "Move drill up" },
		{ key: "↓", description: "Move drill down" },
		{ key: "Del", description: "Delete selected drill" },
		{ key: "Enter", description: "Edit duration" },
	],
};

export const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({ isOpen, onClose }) => {
	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal */}
			<div
				className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95"
				role="dialog"
				aria-labelledby="shortcuts-title"
				aria-modal="true"
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h2 id="shortcuts-title" className="text-xl font-bold text-foreground">
						Keyboard Shortcuts
					</h2>
					<button
						onClick={onClose}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-hover hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
						aria-label="Close shortcuts overlay"
					>
						<X size={18} />
					</button>
				</div>

				{/* Shortcuts Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* General Shortcuts */}
					<div>
						<h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">General</h3>
						<div className="space-y-3">
							{shortcuts.general.map((shortcut, index) => (
								<div key={index} className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">{shortcut.description}</span>
									<kbd className="inline-flex items-center gap-1 rounded-lg border border-border bg-subtle px-2.5 py-1.5 text-xs font-mono text-foreground shadow-sm">
										{shortcut.key}
									</kbd>
								</div>
							))}
						</div>
					</div>

					{/* Timeline Shortcuts */}
					<div>
						<h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">Timeline</h3>
						<div className="space-y-3">
							{shortcuts.timeline.map((shortcut, index) => (
								<div key={index} className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">{shortcut.description}</span>
									<kbd className="inline-flex items-center gap-1 rounded-lg border border-border bg-subtle px-2.5 py-1.5 text-xs font-mono text-foreground shadow-sm">
										{shortcut.key}
									</kbd>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-6 pt-6 border-t border-border">
					<p className="text-xs text-muted-foreground text-center">
						Press <kbd className="px-1.5 py-0.5 rounded bg-subtle border border-border text-[10px] font-mono">Esc</kbd> or click
						outside to close
					</p>
				</div>
			</div>
		</>
	);
};

export default KeyboardShortcutsOverlay;
