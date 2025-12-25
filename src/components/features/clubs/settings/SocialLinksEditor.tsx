// frontend/src/components/features/clubs/settings/SocialLinksEditor.tsx
"use client";

import { Button, Dropdown, Input } from "@/components/ui";
import { SocialPlatform } from "@/lib/models/Club";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface SocialLinkInput {
	platform: SocialPlatform;
	url: string;
}

interface SocialLinksEditorProps {
	value: SocialLinkInput[];
	onChange: (links: SocialLinkInput[]) => void;
}

const platformOptions = [
	{ value: SocialPlatform.Instagram, label: "Instagram" },
	{ value: SocialPlatform.Facebook, label: "Facebook" },
	{ value: SocialPlatform.Twitter, label: "Twitter / X" },
	{ value: SocialPlatform.YouTube, label: "YouTube" },
	{ value: SocialPlatform.TikTok, label: "TikTok" },
];

export default function SocialLinksEditor({ value, onChange }: SocialLinksEditorProps) {
	const addLink = () => {
		// Find first platform not already used
		const usedPlatforms = value.map((l) => l.platform);
		const availablePlatform = platformOptions.find((p) => !usedPlatforms.includes(p.value));

		if (!availablePlatform) return;

		onChange([...value, { platform: availablePlatform.value, url: "" }]);
	};

	const updateLink = (index: number, updates: Partial<SocialLinkInput>) => {
		const newLinks = [...value];
		newLinks[index] = { ...newLinks[index], ...updates };
		onChange(newLinks);
	};

	const removeLink = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const canAddMore = value.length < platformOptions.length;

	return (
		<div className="space-y-3">
			<label className="block text-sm font-medium text-white">Social Links</label>

			{value.length === 0 ? (
				<p className="text-sm text-muted">No social links added yet.</p>
			) : (
				<div className="space-y-2">
					{value.map((link, index) => (
						<div key={index} className="flex items-center gap-3">
							<GripVertical className="text-muted shrink-0" size={16} />
							<div className="w-40 shrink-0">
								<Dropdown
									value={link.platform}
									onChange={(val) => updateLink(index, { platform: val as SocialPlatform })}
									options={platformOptions.map((p) => ({
										...p,
										disabled: value.some((l, i) => i !== index && l.platform === p.value),
									}))}
									size="sm"
								/>
							</div>
							<div className="flex-1">
								<Input value={link.url} onChange={(e) => updateLink(index, { url: e.target.value })} placeholder="https://..." size="sm" />
							</div>
							<button type="button" onClick={() => removeLink(index)} className="p-2 text-muted hover:text-red-400 transition-colors">
								<Trash2 size={16} />
							</button>
						</div>
					))}
				</div>
			)}

			{canAddMore && (
				<Button type="button" variant="ghost" size="sm" onClick={addLink} leftIcon={<Plus size={16} />}>
					Add Social Link
				</Button>
			)}
		</div>
	);
}
