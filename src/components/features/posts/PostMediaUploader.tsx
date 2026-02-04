"use client";

import { useMediaUpload } from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface UploadedMedia {
	id: string;
	file: File;
	preview: string;
	type: "image" | "document";
	status: "uploading" | "done" | "error";
}

interface PostMediaUploaderProps {
	mediaIds: string[];
	onMediaChange: (ids: string[]) => void;
	maxFiles?: number;
}

const ACCEPTED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

export default function PostMediaUploader({ mediaIds, onMediaChange, maxFiles = 10 }: PostMediaUploaderProps) {
	const [uploads, setUploads] = useState<UploadedMedia[]>([]);
	const [isDragActive, setIsDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const uploadMutation = useMediaUpload();

	const handleFiles = async (files: File[]) => {
		const remainingSlots = maxFiles - uploads.length;
		const filesToUpload = files.filter((file) => ACCEPTED_TYPES.includes(file.type)).slice(0, remainingSlots);

		for (const file of filesToUpload) {
			const isImage = file.type.startsWith("image/");
			const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;

			if (file.size > maxSize) {
				// TODO: Show error toast
				continue;
			}

			const tempId = `temp-${Date.now()}-${Math.random()}`;
			const preview = isImage ? URL.createObjectURL(file) : "";

			// Add to local state
			setUploads((prev) => [
				...prev,
				{
					id: tempId,
					file,
					preview,
					type: isImage ? "image" : "document",
					status: "uploading",
				},
			]);

			try {
				const mediaId = await uploadMutation.mutateAsync(file);

				setUploads((prev) => prev.map((u) => (u.id === tempId ? { ...u, id: mediaId, status: "done" } : u)));

				onMediaChange([...mediaIds, mediaId]);
			} catch (error) {
				setUploads((prev) => prev.map((u) => (u.id === tempId ? { ...u, status: "error" } : u)));
			}
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(false);
		const files = Array.from(e.dataTransfer.files);
		handleFiles(files);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragActive(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		handleFiles(files);
		// Reset input so same file can be selected again
		e.target.value = "";
	};

	const removeMedia = (id: string) => {
		setUploads((prev) => {
			const item = prev.find((u) => u.id === id);
			if (item?.preview) URL.revokeObjectURL(item.preview);
			return prev.filter((u) => u.id !== id);
		});
		onMediaChange(mediaIds.filter((mid) => mid !== id));
	};

	return (
		<div className="space-y-3">
			{/* Previews */}
			{uploads.length > 0 && (
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
					{uploads.map((upload) => (
						<div key={upload.id} className="relative group aspect-square rounded-lg overflow-hidden bg-surface border border-border">
							{upload.type === "image" ? (
								<img src={upload.preview} alt="" className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex flex-col items-center justify-center p-2">
									<FileText size={32} className="text-muted-foreground mb-2" />
									<span className="text-xs text-muted-foreground text-center truncate w-full">{upload.file.name}</span>
								</div>
							)}

							{/* Status overlay */}
							{upload.status === "uploading" && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<Loader2 className="animate-spin text-white" size={24} />
								</div>
							)}

							{upload.status === "error" && (
								<div className="absolute inset-0 bg-destructive/50 flex items-center justify-center">
									<span className="text-xs text-white">Failed</span>
								</div>
							)}

							{/* Remove button */}
							<button
								type="button"
								onClick={() => removeMedia(upload.id)}
								className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
								<X size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Dropzone */}
			{uploads.length < maxFiles && (
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onClick={() => inputRef.current?.click()}
					className={cn(
						"border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
						isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-white/20"
					)}>
					<input ref={inputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleInputChange} className="hidden" />
					<Upload size={24} className="mx-auto text-muted-foreground mb-2" />
					<p className="text-sm text-muted-foreground">{isDragActive ? "Drop files here" : "Drag & drop or click to upload"}</p>
					<p className="text-xs text-muted-foreground mt-1">Images (10MB) or documents (25MB)</p>
				</div>
			)}
		</div>
	);
}
