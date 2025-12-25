"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, AlertCircle, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

type DropdownSize = "xs" | "sm" | "md" | "lg" | "xl";
type DropdownVariant = "default" | "bordered" | "ghost";

export interface DropdownOption<T = any> {
    value: string | number;
    label: string;
    data?: T;
    disabled?: boolean;
}

export interface DropdownProps<T = any>
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
    label?: string;
    error?: string;
    helperText?: string;
    options: DropdownOption<T>[];
    value?: string | number | null;
    onChange: (value: string | number | null) => void;
    placeholder?: string;
    leftIcon?: React.ReactNode;
    renderOption?: (option: DropdownOption<T>) => React.ReactNode;
    renderValue?: (option: DropdownOption<T>) => React.ReactNode;
    clearable?: boolean;
    disabled?: boolean;
    required?: boolean;
    variant?: DropdownVariant;
    size?: DropdownSize;
    optional?: boolean;
}

export default function Dropdown<T = any>({
    className,
    variant = "bordered",
    size = "md",
    label,
    error,
    helperText,
    options,
    value,
    onChange,
    placeholder = "Select...",
    leftIcon,
    renderOption,
    renderValue,
    clearable = false,
    disabled = false,
    required = false,
    optional,
    ...props
}: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const detailsRef = useRef<HTMLDetailsElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // DaisyUI size classes for the button
    const sizeClass = {
        xs: "btn-xs",
        sm: "btn-sm",
        md: "btn-md",
        lg: "btn-lg",
        xl: "btn-xl",
    }[size];

    // DaisyUI variant classes
    const variantClass = {
        default: "",
        bordered: "btn-outline",
        ghost: "btn-ghost",
    }[variant];

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
                detailsRef.current.removeAttribute("open");
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: DropdownOption<T>) => {
        if (option.disabled) return;
        onChange(option.value);
        detailsRef.current?.removeAttribute("open");
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(null);
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={cn("form-control w-full", className)} {...props}>
            {label && (
                <label className={cn("label", disabled && "opacity-50")}>
                    <span className={cn("label-text", error && "text-error")}>
                        {label}
                        {required && <span className="text-error ml-1">*</span>}
                        {optional && !required && <span className="text-base-content/50 ml-1.5 font-normal text-xs">(optional)</span>}
                    </span>
                </label>
            )}

            <details
                ref={detailsRef}
                className={cn("dropdown w-full", disabled && "pointer-events-none opacity-50")}
                onToggle={handleToggle}
            >
                <summary
                    className={cn(
                        "btn w-full justify-between",
                        sizeClass,
                        variantClass,
                        error && "btn-error btn-outline",
                        "font-normal"
                    )}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {leftIcon && <span className="text-base-content/50">{leftIcon}</span>}
                        <span className={cn("truncate", !selectedOption && "text-base-content/50")}>
                            {selectedOption
                                ? renderValue
                                    ? renderValue(selectedOption)
                                    : selectedOption.label
                                : placeholder}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {clearable && selectedOption && (
                            <div
                                onClick={handleClear}
                                className="p-0.5 rounded-full hover:bg-base-content/10 transition-colors cursor-pointer"
                            >
                                <X size={14} />
                            </div>
                        )}
                        <ChevronDown
                            size={16}
                            className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                        />
                    </div>
                </summary>

                <ul className="dropdown-content menu bg-base-200 rounded-box z-50 w-full p-2 shadow-lg max-h-60 overflow-y-auto">
                    {options.length > 0 ? (
                        options.map((option) => (
                            <li key={option.value}>
                                <a
                                    onClick={() => handleSelect(option)}
                                    className={cn(
                                        option.value === value && "active",
                                        option.disabled && "disabled opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {renderOption ? renderOption(option) : option.label}
                                </a>
                            </li>
                        ))
                    ) : (
                        <li className="text-center text-base-content/50 py-2">No options found</li>
                    )}
                </ul>
            </details>

            {helperText && !error && <p className="mt-1.5 text-xs text-base-content/50">{helperText}</p>}

            {error && (
                <div className="flex items-center gap-1.5 mt-1.5 text-error animate-in slide-in-from-top-1 fade-in duration-200">
                    <AlertCircle size={14} />
                    <span className="text-xs">{error}</span>
                </div>
            )}
        </div>
    );
}
