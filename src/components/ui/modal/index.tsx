"use client";

import { Loader } from "@/components/ui";
import { PropsWithChildren, useEffect } from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";

type ModalProps = {
	isOpen: boolean;
	isLoading?: boolean;
	onClose: () => void;
	title?: string;
} & PropsWithChildren;

const Modal = ({ isOpen, onClose, children, isLoading, title }: ModalProps) => {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.keyCode === 27) onClose(); // Close modal when Esc key is pressed
		};

		document.body.style.overflow = isOpen ? "hidden" : "unset"; // Prevent scrolling when modal is open
		document.addEventListener("keydown", onKeyDown);

		return () => document.removeEventListener("keydown", onKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex">
			<div className="relative p-5 bg-background max-w-fit m-auto flex-col flex rounded-xl">
				{isLoading && (
					<Loader className="absolute inset-0 bg-black/55" />
				)}{" "}
				<div className="flex justify-between border-b border-muted/20 pb-2 mb-4">
					<span className="text-xl font-bold text-nowrap text-ellipsis overflow-hidden max-w-96">
						{title}
					</span>
					<button onClick={onClose} className="ml-8">
						<FaTimes className="text-white hover:text-gray-300" />
					</button>
				</div>
				{/* Modal Close Button */}
				{/* Modal Content */}
				<div>{children}</div>
			</div>
		</div>,
		document.body
	);
};

export default Modal;
