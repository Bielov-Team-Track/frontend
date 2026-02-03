import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import AttachmentsUploader, { UploadedAttachment } from "./index";

/**
 * # Attachments Uploader
 *
 * A reusable component for uploading and managing file attachments with:
 *
 * - **Drag and drop reordering**: Rearrange attachments by dragging
 * - **Multiple layout variants**: Grid, horizontal scroll, or compact
 * - **Stable layout**: Fixed height container prevents layout jumping
 * - **File type support**: Images and documents (PDF, Word, Excel)
 * - **Upload status**: Visual feedback for uploading, done, and error states
 *
 * ## Usage
 *
 * ```tsx
 * import AttachmentsUploader from "@/components/ui/attachments-uploader";
 *
 * const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
 *
 * <AttachmentsUploader
 *   attachments={attachments}
 *   onAttachmentsChange={setAttachments}
 *   onUpload={async (file) => {
 *     const mediaId = await uploadFile(file);
 *     return mediaId;
 *   }}
 *   maxFiles={4}
 *   variant="horizontal"
 * />
 * ```
 */

const meta: Meta<typeof AttachmentsUploader> = {
	title: "UI/AttachmentsUploader",
	component: AttachmentsUploader,
	parameters: {
		layout: "padded",
		backgrounds: {
			default: "dark",
			values: [{ name: "dark", value: "#121A1B" }],
		},
	},
	decorators: [
		(Story) => (
			<div className="max-w-xl mx-auto p-6">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof AttachmentsUploader>;

// Mock upload function
const mockUpload = async (file: File): Promise<string> => {
	await new Promise((resolve) => setTimeout(resolve, 1500));
	return `media-${Date.now()}-${file.name}`;
};

// =============================================================================
// INTERACTIVE DEMO
// =============================================================================

function InteractiveDemo({ variant }: { variant: "grid" | "horizontal" | "compact" }) {
	const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);

	return (
		<AttachmentsUploader
			attachments={attachments}
			onAttachmentsChange={setAttachments}
			onUpload={mockUpload}
			maxFiles={6}
			variant={variant}
		/>
	);
}

export const Grid: Story = {
	name: "Grid Layout",
	render: () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-medium text-white mb-2">Grid Layout</h3>
				<p className="text-xs text-muted mb-4">
					2x2 grid on mobile, 4 columns on larger screens. Good for displaying many attachments.
				</p>
			</div>
			<InteractiveDemo variant="grid" />
		</div>
	),
};

export const Horizontal: Story = {
	name: "Horizontal Scroll",
	render: () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-medium text-white mb-2">Horizontal Scroll Layout</h3>
				<p className="text-xs text-muted mb-4">
					Single row that scrolls horizontally. Great for comment editors and compact spaces.
				</p>
			</div>
			<InteractiveDemo variant="horizontal" />
		</div>
	),
};

export const Compact: Story = {
	name: "Compact / Wrapped",
	render: () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-medium text-white mb-2">Compact Layout</h3>
				<p className="text-xs text-muted mb-4">
					Small thumbnails that wrap naturally. Ideal for inline editing or tight spaces.
				</p>
			</div>
			<InteractiveDemo variant="compact" />
		</div>
	),
};

// =============================================================================
// WITH EXISTING ATTACHMENTS
// =============================================================================

function WithExistingAttachmentsDemo() {
	const [attachments, setAttachments] = useState<UploadedAttachment[]>([
		{
			id: "1",
			file: new File([], "photo1.jpg"),
			preview: "https://picsum.photos/seed/1/200",
			type: "image",
			status: "done",
			name: "photo1.jpg",
		},
		{
			id: "2",
			file: new File([], "photo2.jpg"),
			preview: "https://picsum.photos/seed/2/200",
			type: "image",
			status: "done",
			name: "photo2.jpg",
		},
		{
			id: "3",
			file: new File([], "document.pdf"),
			preview: "",
			type: "document",
			status: "done",
			name: "report-2024.pdf",
		},
	]);

	return (
		<AttachmentsUploader
			attachments={attachments}
			onAttachmentsChange={setAttachments}
			onUpload={mockUpload}
			maxFiles={6}
			variant="horizontal"
		/>
	);
}

export const WithExistingAttachments: Story = {
	name: "With Existing Attachments",
	render: () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-medium text-white mb-2">Drag to Reorder</h3>
				<p className="text-xs text-muted mb-4">
					Hover over an attachment and drag to reorder. The order is preserved when submitting.
				</p>
			</div>
			<WithExistingAttachmentsDemo />
		</div>
	),
};

// =============================================================================
// HIDDEN DROPZONE WHEN HAS ATTACHMENTS
// =============================================================================

function DisabledDropDemo() {
	const [attachments, setAttachments] = useState<UploadedAttachment[]>([
		{
			id: "1",
			file: new File([], "photo1.jpg"),
			preview: "https://picsum.photos/seed/3/200",
			type: "image",
			status: "done",
			name: "photo1.jpg",
		},
	]);

	return (
		<AttachmentsUploader
			attachments={attachments}
			onAttachmentsChange={setAttachments}
			onUpload={mockUpload}
			maxFiles={4}
			variant="horizontal"
			showEmptyDropzone={false}
			disableDrop
		/>
	);
}

export const DisabledDrop: Story = {
	name: "Disabled Drop (Parent Handles)",
	render: () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-medium text-white mb-2">Drop Handling Disabled</h3>
				<p className="text-xs text-muted mb-4">
					Use disableDrop when the parent component handles drag and drop. Click the plus button to add files.
				</p>
			</div>
			<DisabledDropDemo />
		</div>
	),
};

// =============================================================================
// ALL VARIANTS COMPARISON
// =============================================================================

export const AllVariants: Story = {
	name: "All Variants Comparison",
	render: () => (
		<div className="space-y-12">
			<div>
				<h3 className="text-lg font-semibold text-white mb-4">Grid Layout</h3>
				<InteractiveDemo variant="grid" />
			</div>

			<div className="border-t border-white/10 pt-12">
				<h3 className="text-lg font-semibold text-white mb-4">Horizontal Scroll</h3>
				<InteractiveDemo variant="horizontal" />
			</div>

			<div className="border-t border-white/10 pt-12">
				<h3 className="text-lg font-semibold text-white mb-4">Compact / Wrapped</h3>
				<InteractiveDemo variant="compact" />
			</div>
		</div>
	),
};
