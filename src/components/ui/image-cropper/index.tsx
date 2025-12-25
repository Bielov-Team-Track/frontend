"use client";

import { Button } from "@/components";
import { cn } from "@/lib/utils";
import { Check, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import Loader from "../loader";

export const readFile = (file: any): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("File read did not return a string."));
			}
		};
		reader.onerror = (error) => reject(error);
		reader.readAsDataURL(file);
	});
};

export const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (error) => reject(error));
		image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
		image.src = url;
	});

export async function getCroppedImg(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }) {
	const image = await createImage(imageSrc);
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		return null;
	}

	canvas.width = image.width;
	canvas.height = image.height;

	ctx.drawImage(image, 0, 0);

	const croppedCanvas = document.createElement("canvas");

	const croppedCtx = croppedCanvas.getContext("2d");

	if (!croppedCtx) {
		return null;
	}

	// Set the size of the cropped canvas
	croppedCanvas.width = pixelCrop.width;
	croppedCanvas.height = pixelCrop.height;

	// Draw the cropped image onto the new canvas
	croppedCtx.drawImage(canvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

	return new Promise((resolve) => {
		croppedCanvas.toBlob((file) => {
			resolve(file!);
		}, "image/png");
	});
}

interface ImageCropperProps {
	imageFile: File;
	onImageSave: (file: Blob) => void;
	onCancel?: () => void;
	aspect?: number;
	className?: string;
}

const ImageCropper = ({ imageFile, onImageSave, onCancel, aspect = 1, className }: ImageCropperProps) => {
	const [image, setImage] = useState<string>();
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!imageFile) {
			return;
		}

		readFile(imageFile).then((imageDataUrl) => {
			setImage(imageDataUrl);
		});
	}, [imageFile]);

	const saveImage = async () => {
		setIsSaving(true);
		try {
			const croppedImage = await getCroppedImg(image!, croppedAreaPixels!);
			onImageSave(croppedImage as Blob);
			setIsSaving(false);
		} catch (e) {
			console.error(e);
			setIsSaving(false);
		}
	};

	const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
		setCroppedAreaPixels(croppedAreaPixels);
	};

	return (
		<div className={cn("flex flex-col rounded-2xl bg-[#141414] border border-white/10 overflow-hidden", className)}>
			{/* Cropper Area */}
			<div className="relative w-full aspect-4/3 bg-black/50">
				{image ? (
					<Cropper
						image={image}
						crop={crop}
						zoom={zoom}
						onCropChange={setCrop}
						aspect={aspect}
						onZoomChange={setZoom}
						onCropComplete={onCropComplete}
						classes={{
							containerClassName: "rounded-t-2xl",
						}}
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center">
						<Loader />
					</div>
				)}
				{isSaving && (
					<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
						<Loader />
						<span className="mt-3 text-sm font-medium text-white">Saving...</span>
					</div>
				)}
			</div>

			{/* Controls Area */}
			<div className="p-4 space-y-4 bg-inherit">
				{/* Zoom Control */}
				<div className="flex items-center gap-3 px-2">
					<ZoomOut size={16} className="text-muted" />
					<input
						type="range"
						value={zoom}
						min={1}
						max={3}
						step={0.1}
						aria-labelledby="Zoom"
						onChange={(e) => setZoom(Number(e.target.value))}
						className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hover:bg-primary/90 transition-all"
					/>
					<ZoomIn size={16} className="text-muted" />
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3 pt-2">
					{onCancel && (
						<Button variant="ghost" color="neutral" fullWidth onClick={onCancel} disabled={isSaving}>
							Cancel
						</Button>
					)}
					<Button
						variant="solid"
						color="primary"
						fullWidth
						onClick={saveImage}
						disabled={isSaving || !image}
						loading={isSaving}
						leftIcon={!isSaving && <Check size={18} />}>
						Save Crop
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ImageCropper;
