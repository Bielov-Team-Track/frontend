"use client";

import { Button, Input, Select, TextArea } from "@/components";
import Modal from "@/components/ui/modal";
import { CreateGroupRequest, Group, SkillLevel, UpdateGroupRequest } from "@/lib/models/Club";
import { Check, ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ImageCropper from "@/components/ui/image-cropper";

const GROUP_COLORS = [
	"#FF6B6B",
	"#4ECDC4",
	"#45B7D1",
	"#96CEB4",
	"#FFEAA7",
	"#DDA0DD",
	"#98D8C8",
	"#F7DC6F",
	"#BB8FCE",
	"#85C1E9",
	"#F1948A",
	"#82E0AA",
	"#F8C471",
	"#AED6F1",
	"#D7BDE2",
];

const SKILL_LEVEL_OPTIONS = [
	{ value: "", label: "No skill level (optional)" },
	...Object.values(SkillLevel).map((level) => ({
		value: level,
		label: level,
	})),
];

interface GroupFormModalProps {
	isOpen: boolean;
	group?: Group | null;
	clubId: string;
	onClose: () => void;
	onSubmit: (data: CreateGroupRequest | UpdateGroupRequest) => void;
	isLoading?: boolean;
	onUploadImage?: (image: Blob) => Promise<string>;
}

export default function GroupFormModal({ isOpen, group, clubId, onClose, onSubmit, isLoading = false, onUploadImage }: GroupFormModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [color, setColor] = useState(GROUP_COLORS[0]);
	const [skillLevel, setSkillLevel] = useState<string>("");
	const [logoUrl, setLogoUrl] = useState<string>("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [showImageCropper, setShowImageCropper] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isEditing = !!group;

	useEffect(() => {
		if (group) {
			setName(group.name);
			setDescription(group.description || "");
			setColor(group.color || GROUP_COLORS[0]);
			setSkillLevel(group.skillLevel || "");
			setLogoUrl(group.logoUrl || "");
		} else {
			setName("");
			setDescription("");
			setColor(GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)]);
			setSkillLevel("");
			setLogoUrl("");
		}
		setImageFile(null);
		setShowImageCropper(false);
	}, [group, isOpen]);

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setImageFile(file);
			setShowImageCropper(true);
		}
		event.target.value = "";
	};

	const handleImageSave = async (croppedImage: Blob) => {
		if (!onUploadImage) return;
		setIsUploading(true);
		try {
			const url = await onUploadImage(croppedImage);
			setLogoUrl(url);
			setShowImageCropper(false);
		} catch (error) {
			console.error("Image upload error:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		if (isEditing) {
			onSubmit({
				name: name.trim(),
				description: description.trim() || undefined,
				color,
				logoUrl: logoUrl || undefined,
				skillLevel: skillLevel || undefined,
			} as UpdateGroupRequest);
		} else {
			onSubmit({
				clubId,
				name: name.trim(),
				description: description.trim() || undefined,
				color,
				logoUrl: logoUrl || undefined,
				skillLevel: skillLevel || undefined,
			} as CreateGroupRequest);
		}
	};

	if (showImageCropper && imageFile) {
		return (
			<Modal isOpen={isOpen} onClose={() => setShowImageCropper(false)} title="Crop Group Logo" size="md" preventOutsideClose>
				<ImageCropper
					imageFile={imageFile}
					onImageSave={handleImageSave}
					onCancel={() => setShowImageCropper(false)}
					className="border-0"
				/>
			</Modal>
		);
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Group" : "Create Group"} size="md" preventOutsideClose>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input label="Group Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter group name" required />

				<TextArea
					label="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Describe your group"
					minRows={3}
					optional
				/>

				{/* Logo upload */}
				{onUploadImage && (
					<div>
						<label className="block text-sm font-medium text-foreground mb-2">Group Logo</label>
						{logoUrl ? (
							<div className="flex items-center gap-3">
								<img src={logoUrl} alt="Group logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
								<div className="flex gap-2">
									<Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
										Change
									</Button>
									<Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl("")}>
										Remove
									</Button>
								</div>
							</div>
						) : (
							<div
								className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-hover hover:border-border transition-all gap-2 group"
								onClick={() => fileInputRef.current?.click()}
							>
								<div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
									<ImageIcon size={20} />
								</div>
								<span className="text-xs text-muted-foreground">Click to upload logo</span>
							</div>
						)}
						<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
					</div>
				)}

				<div>
					<label className="block text-sm font-medium text-foreground mb-2">Group Color</label>
					<div className="flex flex-wrap gap-2">
						{GROUP_COLORS.map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => setColor(c)}
								className={`w-8 h-8 rounded-lg transition-all ${
									color === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
								}`}
								style={{ backgroundColor: c }}>
								{color === c && <Check size={16} className="text-white mx-auto" />}
							</button>
						))}
					</div>
				</div>

				<Select
					label="Skill Level"
					value={skillLevel}
					onChange={(value) => setSkillLevel(value)}
					options={SKILL_LEVEL_OPTIONS}
				/>

				<div className="flex gap-3 pt-4">
					<Button type="button" variant="ghost" color="neutral" fullWidth onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="default" color="accent" fullWidth disabled={!name.trim() || isUploading} loading={isLoading}>
						{isEditing ? "Save Changes" : "Create Group"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
