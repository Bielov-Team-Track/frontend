import { useState } from "react";
import { Plus, X, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CasualTeamSlot } from "../../types/registration";

const DEFAULT_PRESET_COLORS = [
	"#FF6B6B",
	"#4ECDC4",
	"#45B7D1",
	"#FFA07A",
	"#98D8C8",
	"#F7DC6F",
	"#BB8FCE",
	"#85C1E2",
];

interface CasualPlayTeamSlotsProps {
	slots: CasualTeamSlot[];
	onChange: (slots: CasualTeamSlot[]) => void;
}

export function CasualPlayTeamSlots({ slots, onChange }: CasualPlayTeamSlotsProps) {
	const addSlot = () => {
		const usedColors = slots.map(s => s.color);
		const availableColor = DEFAULT_PRESET_COLORS.find(c => !usedColors.includes(c)) || DEFAULT_PRESET_COLORS[0];

		onChange([
			...slots,
			{ name: `Team ${slots.length + 1}`, color: availableColor }
		]);
	};

	const removeSlot = (index: number) => {
		onChange(slots.filter((_, i) => i !== index));
	};

	const updateSlot = (index: number, updates: Partial<CasualTeamSlot>) => {
		onChange(slots.map((slot, i) => i === index ? { ...slot, ...updates } : slot));
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-white">Team Slots</h3>
				<button
					type="button"
					onClick={addSlot}
					className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
				>
					<Plus size={14} />
					Add Team
				</button>
			</div>

			<div className="space-y-3">
				{slots.map((slot, index) => (
					<div
						key={index}
						className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4"
					>
						<div
							className="w-6 h-6 rounded-full border border-white/20 cursor-pointer relative group"
							style={{ backgroundColor: slot.color }}
						>
							<input
								type="color"
								value={slot.color}
								onChange={(e) => updateSlot(index, { color: e.target.value })}
								className="absolute inset-0 opacity-0 cursor-pointer"
							/>
						</div>

						<input
							type="text"
							value={slot.name}
							onChange={(e) => updateSlot(index, { name: e.target.value })}
							className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent"
							placeholder="Team name"
						/>

						{slots.length > 2 && (
							<button
								type="button"
								onClick={() => removeSlot(index)}
								className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
							>
								<X size={16} />
							</button>
						)}
					</div>
				))}
			</div>

			{slots.length < 2 && (
				<p className="text-xs text-yellow-400">
					Add at least 2 teams to continue
				</p>
			)}
		</div>
	);
}
