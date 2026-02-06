"use client";

import html2canvas from "html2canvas-pro";
import { Bug, Camera, MessageSquare, Monitor } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FeedbackModal } from "./FeedbackModal";
import { RegionSelector } from "./RegionSelector";
import type { ConsoleEntry, NetworkEntry, Region } from "./types";
import { useDiagnostics } from "./useDiagnostics";

type FeedbackState = "idle" | "choosing" | "selecting" | "annotating";

export function FeedbackButton() {
	const [state, setState] = useState<FeedbackState>("idle");
	const [screenshot, setScreenshot] = useState<string>("");
	const [croppedImage, setCroppedImage] = useState<string>("");
	const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
	const [diagnostics, setDiagnostics] = useState<{ consoleLogs: ConsoleEntry[]; networkErrors: NetworkEntry[] }>({
		consoleLogs: [],
		networkErrors: [],
	});

	const { getDiagnostics } = useDiagnostics();

	// Check if beta mode is enabled
	const isBetaMode = process.env.NEXT_PUBLIC_BETA_MODE === "true";

	// Capture using html2canvas-pro (supports lab/oklch colors)
	const captureWithHtml2Canvas = useCallback(async (): Promise<string | null> => {
		try {
			const canvas = await html2canvas(document.body, {
				useCORS: true,
				allowTaint: true,
				logging: false,
				scale: Math.min(window.devicePixelRatio || 1, 2),
				ignoreElements: (element) => {
					return element.id === "feedback-button" || element.closest("#feedback-button") !== null;
				},
			});
			return canvas.toDataURL("image/png");
		} catch (error) {
			console.error("html2canvas-pro capture failed:", error);
			return null;
		}
	}, []);

	const handleWithScreenshot = useCallback(async () => {
		setState("idle"); // Hide the menu first

		try {
			// Hide the feedback button during capture
			const button = document.getElementById("feedback-button");
			if (button) button.style.visibility = "hidden";

			const dataUrl = await captureWithHtml2Canvas();

			// Show the button again
			if (button) button.style.visibility = "visible";

			if (dataUrl) {
				setScreenshot(dataUrl);
				setState("selecting");
			} else {
				// Fallback to text-only if capture failed
				console.warn("Screenshot capture failed, falling back to text-only");
				setCroppedImage("");
				setSelectedRegion({ x: 0, y: 0, width: 0, height: 0 });
				setState("annotating");
			}
		} catch (error) {
			console.error("Failed to capture screenshot:", error);
			// Show the button again if capture failed
			const button = document.getElementById("feedback-button");
			if (button) button.style.visibility = "visible";

			// Fallback to text-only
			setCroppedImage("");
			setSelectedRegion({ x: 0, y: 0, width: 0, height: 0 });
			setState("annotating");
		}
	}, [captureWithHtml2Canvas]);

	const handleFullScreen = useCallback(async () => {
		setState("idle"); // Hide the menu first

		try {
			const button = document.getElementById("feedback-button");
			if (button) button.style.visibility = "hidden";

			const dataUrl = await captureWithHtml2Canvas();

			if (button) button.style.visibility = "visible";

			if (dataUrl) {
				// Use the full screenshot directly without region selection
				setCroppedImage(dataUrl);
				setSelectedRegion({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
				setState("annotating");
			} else {
				console.warn("Screenshot capture failed, falling back to text-only");
				setCroppedImage("");
				setSelectedRegion({ x: 0, y: 0, width: 0, height: 0 });
				setState("annotating");
			}
		} catch (error) {
			console.error("Failed to capture screenshot:", error);
			const button = document.getElementById("feedback-button");
			if (button) button.style.visibility = "visible";
			setCroppedImage("");
			setSelectedRegion({ x: 0, y: 0, width: 0, height: 0 });
			setState("annotating");
		}
	}, [captureWithHtml2Canvas]);

	const handleClick = useCallback(() => {
		// Capture diagnostics at the moment feedback is initiated
		const captured = getDiagnostics();
		console.log("[Feedback] Captured diagnostics:", {
			consoleLogs: captured.consoleLogs.length,
			networkErrors: captured.networkErrors.length,
		});
		setDiagnostics(captured);
		setState("choosing");
	}, [getDiagnostics]);

	const handleTextOnly = useCallback(() => {
		// Open modal without screenshot
		setCroppedImage("");
		setSelectedRegion({ x: 0, y: 0, width: 0, height: 0 });
		setState("annotating");
	}, []);

	// Keyboard shortcuts: Ctrl/Cmd+Shift+F for text only, Ctrl/Cmd+Shift+S for screenshot
	useEffect(() => {
		if (!isBetaMode) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't trigger if user is typing in an input/textarea
			const target = e.target as HTMLElement;
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
				return;
			}

			// Only trigger when Ctrl/Cmd + Shift is held
			if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;

			const key = e.key.toLowerCase();

			if (key === "f") {
				e.preventDefault();
				console.log("[Feedback] Text-only shortcut triggered");
				const captured = getDiagnostics();
				setDiagnostics(captured);
				setCroppedImage("");
				setSelectedRegion({ x: 0, y: 0, width: 0, height: 0 });
				setState("annotating");
			} else if (key === "s") {
				e.preventDefault();
				console.log("[Feedback] Full-screen screenshot shortcut triggered");
				const captured = getDiagnostics();
				setDiagnostics(captured);
				handleFullScreen();
			} else if (key === "a") {
				e.preventDefault();
				console.log("[Feedback] Area select shortcut triggered");
				const captured = getDiagnostics();
				setDiagnostics(captured);
				handleWithScreenshot();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isBetaMode, getDiagnostics, handleWithScreenshot, handleFullScreen]);

	const handleRegionSelected = useCallback((region: Region, croppedDataUrl: string) => {
		setSelectedRegion(region);
		setCroppedImage(croppedDataUrl);
		setState("annotating");
	}, []);

	const handleCancel = useCallback(() => {
		setState("idle");
		setScreenshot("");
		setCroppedImage("");
		setSelectedRegion(null);
	}, []);

	const handleModalClose = useCallback(() => {
		handleCancel();
	}, [handleCancel]);

	// Don't render if not in beta mode
	if (!isBetaMode) {
		return null;
	}

	return (
		<>
			{/* Floating button */}
			{(state === "idle" || state === "choosing") && (
				<div className="fixed bottom-6 right-4 sm:right-6 z-[9999] pb-safe">
					{/* Choice menu */}
					{state === "choosing" && (
						<>
							{/* Backdrop to close menu */}
							<div className="fixed inset-0 z-[9998]" onClick={() => setState("idle")} />
							<div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-lg shadow-xl overflow-hidden z-[9999] min-w-[220px]">
								<button
									onClick={handleFullScreen}
									className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left">
									<div className="flex items-center gap-3">
										<Monitor className="size-4 text-muted-foreground" />
										<span className="text-sm">Full screen</span>
									</div>
									<kbd className="text-[10px] text-foreground/70 border border-border bg-muted/50 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
										Ctrl+Shift+S
									</kbd>
								</button>
								<button
									onClick={handleWithScreenshot}
									className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left border-t border-border">
									<div className="flex items-center gap-3">
										<Camera className="size-4 text-muted-foreground" />
										<span className="text-sm">Select area</span>
									</div>
									<kbd className="text-[10px] text-foreground/70 border border-border bg-muted/50 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
										Ctrl+Shift+A
									</kbd>
								</button>
								<button
									onClick={handleTextOnly}
									className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left border-t border-border">
									<div className="flex items-center gap-3">
										<MessageSquare className="size-4 text-muted-foreground" />
										<span className="text-sm">Text only</span>
									</div>
									<kbd className="text-[10px] text-foreground/70 border border-border bg-muted/50 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
										Ctrl+Shift+F
									</kbd>
								</button>
							</div>
						</>
					)}

					{/* Main button */}
					<button
						id="feedback-button"
						onClick={handleClick}
						className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-accent text-white rounded-full shadow-lg hover:bg-accent/90 transition-all hover:scale-105 active:scale-95">
						<Bug className="size-4" />
						<span className="text-sm font-medium hidden sm:inline">Feedback</span>
					</button>
				</div>
			)}

			{/* Region selector overlay */}
			{state === "selecting" && screenshot && (
				<RegionSelector
					screenshotDataUrl={screenshot}
					onRegionSelected={handleRegionSelected}
					onCancel={handleCancel}
					onFullScreen={() => {
						// Use the already-captured screenshot as full screen
						setCroppedImage(screenshot);
						setSelectedRegion({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
						setState("annotating");
					}}
				/>
			)}

			{/* Annotation modal */}
			{state === "annotating" && selectedRegion && (
				<FeedbackModal isOpen={true} onClose={handleModalClose} croppedImage={croppedImage} region={selectedRegion} diagnostics={diagnostics} />
			)}
		</>
	);
}
