import { Button } from "@/components";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import ImageCropper from "./index";

const meta: Meta<typeof ImageCropper> = {
	title: "UI/ImageCropper",
	component: ImageCropper,
	parameters: {
		layout: "centered",
		backgrounds: {
			default: "dark",
		},
		docs: {
			description: {
				component: "An image cropping component using react-easy-crop. Features a dark theme UI, zoom slider, and responsive layout.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		imageFile: {
			description: "The image file to be cropped",
			control: { type: "file" },
		},
		onImageSave: {
			description: "Callback function called when the cropped image is saved. Receives a Blob.",
		},
		onCancel: {
			description: "Callback function called when the cancel button is clicked",
		},
		aspect: {
			description: "Aspect ratio of the crop area (default: 1)",
			control: { type: "number", min: 0.1, step: 0.1 },
		},
	},
	decorators: [
		(Story) => (
			<div className="w-[400px]">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with file upload
const InteractiveTemplate = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setCroppedImageUrl(null);
		}
	};

	const handleImageSave = (croppedImageBlob: Blob) => {
		const url = URL.createObjectURL(croppedImageBlob);
		setCroppedImageUrl(url);
		setSelectedFile(null); // Reset to show result
	};

	const handleCancel = () => {
		setSelectedFile(null);
	};

	const loadSampleImage = () => {
		const canvas = document.createElement("canvas");
		canvas.width = 800;
		canvas.height = 600;
		const ctx = canvas.getContext("2d");

		if (ctx) {
			const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
			gradient.addColorStop(0, "#ff7b7b");
			gradient.addColorStop(0.5, "#4ecdc4");
			gradient.addColorStop(1, "#45b7d1");
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = "#ffffff";
			ctx.font = "bold 48px Arial";
			ctx.textAlign = "center";
			ctx.fillText("Sample Image", canvas.width / 2, canvas.height / 2);
		}

		canvas.toBlob((blob) => {
			if (blob) {
				const file = new File([blob], "sample-image.png", {
					type: "image/png",
				});
				setSelectedFile(file);
				setCroppedImageUrl(null);
			}
		});
	};

	return (
		<div className="w-full max-w-lg mx-auto space-y-6 text-white">
			{!selectedFile && !croppedImageUrl && (
				<div className="flex flex-col items-center gap-4 p-8 border border-dashed border-white/20 rounded-2xl bg-white/5">
					<h3 className="text-lg font-semibold">Upload an image</h3>
					<div className="flex flex-col gap-3 w-full max-w-xs">
						<input
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							className="file-input file-input-bordered w-full bg-[#141414] border-white/10"
						/>
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-white/10" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-[#141414] px-2 text-muted">Or</span>
							</div>
						</div>
						<Button onClick={loadSampleImage} variant="outline" fullWidth>
							Use Sample Image
						</Button>
					</div>
				</div>
			)}

			{selectedFile && <ImageCropper imageFile={selectedFile} onImageSave={handleImageSave} onCancel={handleCancel} />}

			{croppedImageUrl && (
				<div className="space-y-4 text-center animate-in fade-in zoom-in duration-300">
					<h4 className="font-medium text-lg">Result</h4>
					<div className="flex justify-center p-2 bg-white/5 rounded-xl border border-white/10 inline-block">
						{/* eslint-disable-next-line @next/next/no-img-element*/}
						<img src={croppedImageUrl} alt="Cropped result" className="max-w-xs rounded-lg shadow-2xl" />
					</div>
					<div>
						<Button onClick={() => setCroppedImageUrl(null)} variant="ghost">
							Crop Another
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};

export const Interactive: Story = {
	render: InteractiveTemplate,
	decorators: [
		(Story) => (
			<div className="w-[600px]">
				<Story />
			</div>
		),
	],
};
