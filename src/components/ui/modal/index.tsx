"use client";

import { cn } from "@/lib/utils";
import { Dialog, DialogPreventClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../dialog";
import Loader from "../loader";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	description?: string;
	children: React.ReactNode;
	size?: ModalSize;
	isLoading?: boolean;
	className?: string;
	showCloseButton?: boolean;
	preventOutsideClose?: boolean;
	"data-testid"?: string;
}

const sizeClasses: Record<ModalSize, string> = {
	sm: "sm:max-w-md",
	md: "sm:max-w-lg",
	lg: "sm:max-w-2xl",
	xl: "sm:max-w-4xl",
	full: "sm:max-w-[calc(100vw-2rem)] min-h-[calc(100vh-2rem)]",
};

export default function Modal({
	isOpen,
	onClose,
	title,
	description,
	children,
	size = "md",
	isLoading = false,
	className,
	showCloseButton = true,
	preventOutsideClose = false,
	"data-testid": dataTestId,
}: ModalProps) {
	const DialogRoot = preventOutsideClose ? DialogPreventClose : Dialog;

	return (
		<DialogRoot open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent showCloseButton={showCloseButton} className={cn(sizeClasses[size], className)} data-testid={dataTestId}>
				{isLoading && (
					<div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
						<Loader />
					</div>
				)}

				{(title || description) && (
					<DialogHeader>
						{title && <DialogTitle>{title}</DialogTitle>}
						{description && <DialogDescription>{description}</DialogDescription>}
					</DialogHeader>
				)}

				<div className="max-h-[80dvh] overflow-auto">{children}</div>
			</DialogContent>
		</DialogRoot>
	);
}

export { Modal };
export type { ModalProps, ModalSize };
