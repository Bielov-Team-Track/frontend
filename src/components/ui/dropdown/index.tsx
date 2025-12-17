"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { ChevronDown, AlertCircle, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const dropdownVariants = cva(
    "flex items-center justify-between w-full rounded-xl transition-all duration-200 text-white placeholder:text-muted/50 outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 border cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    "bg-white/5 border-white/10 hover:bg-white/[0.07]",
                bordered:
                    "bg-white/5 border-white/10 hover:border-accent/50",
                ghost: "border-transparent bg-transparent hover:bg-white/5",
            },
            size: {
                sm: "h-9 text-sm px-3",
                md: "h-11 text-sm px-4",
                lg: "h-12 text-base px-4",
            },
            status: {
                default: "",
                error: "border-red-500/50 hover:border-red-500 bg-red-500/5",
            },
        },
        defaultVariants: {
            variant: "bordered",
            size: "md",
            status: "default",
        },
    }
);

export interface DropdownOption<T = any> {
    value: string | number;
    label: string;
    data?: T;
    disabled?: boolean;
}

export interface DropdownProps<T = any>
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value">,
        VariantProps<typeof dropdownVariants> {
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
}

export default function Dropdown<T = any>({
    className,
    variant,
    size,
    status,
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
    ...props
}: DropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);
    const effectiveStatus = error ? "error" : status;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (option: DropdownOption<T>) => {
        if (option.disabled) return;
        onChange(option.value);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div
            className={cn("form-control w-full", className)}
            ref={containerRef}
        >
            {label && (
                <label
                    className={cn(
                        "block text-sm font-medium text-white mb-2",
                        error && "text-red-400",
                        disabled && "opacity-50"
                    )}
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <div
                    className={cn(
                        dropdownVariants({ variant, size, status: effectiveStatus }),
                        leftIcon && "pl-11",
                        disabled && "opacity-50 pointer-events-none"
                    )}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    {/* Left Icon */}
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                            {leftIcon}
                        </div>
                    )}

                    {/* Value Display */}
                    <div className="flex-1 truncate mr-2">
                        {selectedOption ? (
                            renderValue ? (
                                renderValue(selectedOption)
                            ) : (
                                selectedOption.label
                            )
                        ) : (
                            <span className="text-muted/50">{placeholder}</span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {clearable && selectedOption && !disabled && (
                            <div
                                onClick={handleClear}
                                className="p-0.5 rounded-full hover:bg-white/10 text-muted transition-colors cursor-pointer"
                            >
                                <X size={14} />
                            </div>
                        )}
                        <ChevronDown
                            size={16}
                            className={cn(
                                "text-muted transition-transform duration-200",
                                isOpen && "rotate-180"
                            )}
                        />
                    </div>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 w-full mt-1 overflow-hidden bg-[#1e1e1e] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        >
                            {options.length > 0 ? (
                                <div className="p-1">
                                    {options.map((option) => (
                                        <div
                                            key={option.value}
                                            onClick={() => handleSelect(option)}
                                            className={cn(
                                                "px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                                                option.value === value
                                                    ? "bg-primary/20 text-primary"
                                                    : "hover:bg-white/5 text-white/90",
                                                option.disabled &&
                                                    "opacity-50 cursor-not-allowed hover:bg-transparent"
                                            )}
                                        >
                                            {renderOption
                                                ? renderOption(option)
                                                : option.label}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-sm text-center text-muted">
                                    No options found
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Helper Text & Error */}
            {helperText && !error && (
                <p className="mt-1.5 text-xs text-muted">{helperText}</p>
            )}
            {error && (
                <div className="flex items-center gap-1.5 mt-1.5 text-red-400 animate-in slide-in-from-top-1 fade-in duration-200">
                    <AlertCircle size={14} />
                    <span className="text-xs">{error}</span>
                </div>
            )}
        </div>
    );
}
