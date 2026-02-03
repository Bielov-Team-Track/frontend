"use client";

import { cn } from "@/lib/utils";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { DocumentPreviewProps } from "../types";
import { getFileName, getViewerUrl } from "../utils";

export default function DocumentPreview({ item, className }: DocumentPreviewProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	const fileName = getFileName(item);

	// Check if URL is a blob URL (local file) - external viewers won't work with these
	const isBlobUrl = item.url.startsWith("blob:");

	// Only use external viewer for public URLs
	const viewerUrl = isBlobUrl ? null : getViewerUrl(item);

	const handleLoad = useCallback(() => {
		setIsLoading(false);
	}, []);

	const handleError = useCallback(() => {
		setIsLoading(false);
		setHasError(true);
	}, []);

	const handleOpenInNewTab = useCallback(() => {
		window.open(item.url, "_blank", "noopener,noreferrer");
	}, [item.url]);

	const handleDownload = useCallback(() => {
		const link = document.createElement("a");
		link.href = item.url;
		link.download = fileName;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, [item.url, fileName]);

	// Fallback UI when embed is not available or fails
	if (!viewerUrl || hasError) {
		return (
			<div className={cn("w-full h-full flex flex-col items-center justify-center gap-6 p-8", className)}>
				<div className="text-center">
					<p className="text-lg font-medium text-foreground mb-2">{fileName}</p>
					<p className="text-sm text-muted-foreground">
						{hasError
							? "Unable to preview this document"
							: isBlobUrl
								? "Preview available after upload"
								: "Preview not available for this file type"}
					</p>
				</div>

				<div className="flex gap-3">
					<button
						onClick={handleOpenInNewTab}
						className={cn(
							"inline-flex items-center gap-2 px-4 py-2 rounded-lg",
							"bg-primary text-primary-foreground",
							"hover:bg-primary/90 transition-colors",
							"text-sm font-medium"
						)}>
						<ExternalLink size={16} />
						Open in new tab
					</button>

					<button
						onClick={handleDownload}
						className={cn(
							"inline-flex items-center gap-2 px-4 py-2 rounded-lg",
							"bg-secondary text-secondary-foreground",
							"hover:bg-secondary/80 transition-colors",
							"text-sm font-medium"
						)}>
						<Download size={16} />
						Download
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("w-full h-full relative", className)}>
			{/* Loading spinner */}
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
						<p className="text-sm text-muted-foreground">Loading document...</p>
					</div>
				</div>
			)}

			{/* Document iframe */}
			<iframe
				src={viewerUrl}
				title={fileName}
				className="w-full h-full border-0"
				onLoad={handleLoad}
				onError={handleError}
				sandbox="allow-scripts allow-same-origin allow-popups"
			/>
		</div>
	);
}
