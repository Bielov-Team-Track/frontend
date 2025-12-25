"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import Loader from "../loader";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
type ModalPosition = "top" | "middle" | "bottom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: ModalSize;
    position?: ModalPosition;
    isLoading?: boolean;
    className?: string;
    showCloseButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = "md",
    position = "middle",
    isLoading = false,
    className,
    showCloseButton = true,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            onClose();
        }
    };

    // DaisyUI modal size classes
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[calc(100vw-2rem)] min-h-[calc(100vh-2rem)]",
    };

    // DaisyUI modal position classes
    const positionClass = {
        top: "modal-top",
        middle: "modal-middle",
        bottom: "modal-bottom",
    }[position];

    return (
        <dialog
            ref={dialogRef}
            className={cn("modal", positionClass)}
            onClick={handleBackdropClick}
            onClose={onClose}
        >
            <div className={cn("modal-box", sizeClasses[size], className)}>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm">
                        <Loader />
                    </div>
                )}

                {/* Close Button */}
                {showCloseButton && (
                    <form method="dialog">
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                            onClick={onClose}
                        >
                            <X size={20} />
                        </button>
                    </form>
                )}

                {/* Header */}
                {(title || description) && (
                    <div className="mb-4 pr-8">
                        {title && (
                            <h3 className="font-semibold text-lg">{title}</h3>
                        )}
                        {description && (
                            <p className="text-sm text-base-content/60 mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                )}

                {/* Content */}
                <div>{children}</div>
            </div>

            {/* Backdrop */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}