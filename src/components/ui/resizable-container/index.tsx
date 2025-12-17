"use client";

import { ReactNode, useEffect, useState } from "react";

export interface ResizableContainerProps {
	leftPanel: ReactNode;
	rightPanel: ReactNode;
	initialWidth?: number;
	minWidth?: number;
	maxWidth?: number;
	dividerClassName?: string;
}

const ResizableContainer = ({
	leftPanel,
	rightPanel,
	initialWidth = 384,
	minWidth = 250,
	maxWidth = 600,
	dividerClassName = "w-1 bg-border hover:bg-primary cursor-col-resize transition-colors z-10",
}: ResizableContainerProps) => {
	const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
	const [isResizing, setIsResizing] = useState(false);
	const [startX, setStartX] = useState(0);
	const [startWidth, setStartWidth] = useState(0);

	const startResizing = (e: React.MouseEvent) => {
		setIsResizing(true);
		setStartX(e.clientX);
		setStartWidth(sidebarWidth);
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing) return;
			const delta = e.clientX - startX;
			const newWidth = startWidth + delta;
			if (newWidth >= minWidth && newWidth <= maxWidth) {
				setSidebarWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, startX, startWidth, minWidth, maxWidth]);

	return (
		<div
			className="flex h-full min-h-0 isolate"
			style={{
				cursor: isResizing ? "col-resize" : "default",
				userSelect: isResizing ? "none" : "auto",
			}}>
			<div className="h-full min-h-0" style={{ width: `${sidebarWidth}px` }}>{leftPanel}</div>
			<div className={dividerClassName} onMouseDown={startResizing} />
			<div className="flex-1 h-full min-h-0 -translate-x-1">{rightPanel}</div>
		</div>
	);
};

export default ResizableContainer;
