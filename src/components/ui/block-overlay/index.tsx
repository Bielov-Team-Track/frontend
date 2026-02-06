import React, { PropsWithChildren, ReactNode } from "react";
import { Lock } from "lucide-react";

function BlockOverlay({
	reason,
	className,
	children,
}: { reason: ReactNode; className?: string } & PropsWithChildren) {
	return (
		<div
			className={`absolute inset-0 bg-overlay flex flex-col justify-center gap-4 items-center z-40  ${className}`}
		>
			<Lock size={24} />
			<span>{reason}</span>
			{children}
		</div>
	);
}

export default BlockOverlay;
