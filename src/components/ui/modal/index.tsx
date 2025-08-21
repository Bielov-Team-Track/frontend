"use client";

import { Loader } from '@/components/ui';
import React, { PropsWithChildren, useEffect } from "react";
import ReactDOM from "react-dom";

type ModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
} & PropsWithChildren;

const Modal = ({ isOpen, onClose, children, isLoading }: ModalProps) => {
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
      <div className="relative p-4 bg-black rounded max-w-sm m-auto flex-col flex">
        {isLoading && <Loader className="absolute inset-0 bg-black/55" />}
        {/* Modal Close Button */}
        <button onClick={onClose} className="absolute top-0 right-0 mt-2 mr-2">
          &times;
        </button>
        {/* Modal Content */}
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
