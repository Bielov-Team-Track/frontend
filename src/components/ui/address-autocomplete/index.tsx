"use client";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { ParsedAddress, parsePlacesResult } from "@/lib/utils/address";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { LoaderIcon, MapPin, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Re-export ParsedAddress for backward compatibility
export type { ParsedAddress } from "@/lib/utils/address";

interface AddressSuggestion {
	placeId: string;
	description: string;
	structured_formatting?: {
		main_text: string;
		secondary_text: string;
	};
}

interface AddressAutocompleteProps {
	value?: string;
	onChange?: (value: string) => void;
	onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
	onAddressSelected?: (address: ParsedAddress) => void;
	placeholder?: string;
	label?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
	"aria-invalid"?: boolean;
	searchTypes?: string[];
	allowedCountries?: string[];
}

const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
	(
		{
			value = "",
			onChange,
			onPlaceSelected,
			onAddressSelected,
			placeholder = "Enter address...",
			label,
			error,
			required = false,
			disabled = false,
			className,
			"aria-invalid": ariaInvalid,
			searchTypes,
			allowedCountries = ["uk"],
		},
		ref
	) => {
		const [inputValue, setInputValue] = useState(value);
		const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
		const [isOpen, setIsOpen] = useState(false);
		const [isLoading, setIsLoading] = useState(false);
		const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

		const containerRef = useRef<HTMLDivElement>(null);
		const placesLib = useMapsLibrary("places");

		const updateDropdownPosition = useCallback(() => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setDropdownPosition({
					top: rect.bottom + window.scrollY + 6,
					left: rect.left + window.scrollX,
					width: rect.width,
				});
			}
		}, []);

		useEffect(() => {
			if (isOpen) {
				updateDropdownPosition();
				window.addEventListener("scroll", updateDropdownPosition, { passive: true });
				window.addEventListener("resize", updateDropdownPosition, { passive: true });
				return () => {
					window.removeEventListener("scroll", updateDropdownPosition);
					window.removeEventListener("resize", updateDropdownPosition);
				};
			}
		}, [isOpen, updateDropdownPosition]);

		const autocompleteService = useMemo(() => placesLib && new placesLib.AutocompleteService(), [placesLib]);

		const placesService = useMemo(() => {
			if (placesLib) {
				const dummyDiv = document.createElement("div");
				return new placesLib.PlacesService(dummyDiv);
			}
			return null;
		}, [placesLib]);

		useEffect(() => {
			setInputValue(value);
		}, [value]);

		const fetchSuggestions = async (input: string) => {
			if (!autocompleteService || input.length < 2) {
				setSuggestions([]);
				return;
			}

			setIsLoading(true);

			try {
				const request: google.maps.places.AutocompletionRequest = {
					input,
					componentRestrictions: { country: allowedCountries },
				};

				if (searchTypes) {
					request.types = searchTypes;
				}

				autocompleteService.getPlacePredictions(request, (predictions: any, status: any) => {
					setIsLoading(false);
					console.log(predictions, status);
					if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
						const mappedSuggestions: AddressSuggestion[] = predictions.map((prediction) => ({
							placeId: prediction.place_id,
							description: prediction.description,
							structured_formatting: prediction.structured_formatting,
						}));
						setSuggestions(mappedSuggestions);
						setIsOpen(true);
					} else {
						setSuggestions([]);
						setIsOpen(false);
					}
				});
			} catch (error) {
				console.error("Error fetching address suggestions:", error);
				setIsLoading(false);
				setSuggestions([]);
			}
		};

		const debouncedFetchSuggestions = useDebounce(fetchSuggestions, 300);

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setInputValue(newValue);
			onChange?.(newValue);

			debouncedFetchSuggestions(newValue);
		};

		const handleSuggestionClick = (suggestion: AddressSuggestion) => {
			setInputValue(suggestion.description);
			onChange?.(suggestion.description);
			setSuggestions([]);
			setIsOpen(false);

			if ((onPlaceSelected || onAddressSelected) && placesService) {
				const request = {
					placeId: suggestion.placeId,
					fields: ["formatted_address", "geometry", "name", "place_id", "address_components"],
				};

				placesService.getDetails(request, (place, status) => {
					if (status === google.maps.places.PlacesServiceStatus.OK && place) {
						onPlaceSelected?.(place);
						if (onAddressSelected) {
							const parsedAddress = parsePlacesResult(place);
							onAddressSelected(parsedAddress);
						}
					}
				});
			}
		};

		const handleClearInput = () => {
			setInputValue("");
			onChange?.("");
			setSuggestions([]);
			setIsOpen(false);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Escape") {
				setIsOpen(false);
			}
		};

		const handleBlur = () => {
			setTimeout(() => {
				setIsOpen(false);
			}, 150);
		};

		const hasError = !!error || ariaInvalid;

		return (
			<div ref={containerRef} className={cn("relative isolate w-full flex flex-col gap-2", className)}>
				{label && (
					<Label className={cn(hasError && "text-destructive", disabled && "opacity-50", "gap-1")}>
						{label}
						{required && <span className="text-destructive">*</span>}
					</Label>
				)}

				<InputGroup data-disabled={disabled || undefined}>
					<InputGroupAddon align="inline-start">
						<MapPin className="size-4" />
					</InputGroupAddon>

					<InputGroupInput
						ref={ref}
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						placeholder={placeholder}
						disabled={disabled}
						autoComplete="off"
						aria-invalid={hasError}
					/>

					<InputGroupAddon align="inline-end">
						{isLoading && <LoaderIcon className="size-4 animate-spin text-muted-foreground" />}
						{inputValue && !disabled && !isLoading && (
							<InputGroupButton variant="ghost" size="icon-xs" onClick={handleClearInput} type="button">
								<XIcon className="size-3.5" />
							</InputGroupButton>
						)}
					</InputGroupAddon>
				</InputGroup>

				{isOpen &&
					suggestions.length >= 1 &&
					typeof document !== "undefined" &&
					createPortal(
						<div
							className={cn("fixed", "bg-popover text-popover-foreground", "rounded-lg border shadow-md", "max-h-60 overflow-auto")}
							style={{
								zIndex: 99999,
								top: dropdownPosition.top,
								left: dropdownPosition.left,
								width: dropdownPosition.width,
							}}>
							{suggestions.map((suggestion) => (
								<button
									key={suggestion.placeId}
									type="button"
									onClick={() => handleSuggestionClick(suggestion)}
									className={cn(
										"w-full text-left px-3 py-2",
										"hover:bg-accent hover:text-accent-foreground",
										"focus:bg-accent focus:text-accent-foreground focus:outline-none",
										"border-b border-border last:border-b-0"
									)}>
									<div className="flex items-start gap-2">
										<MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
										<div className="flex-1 min-w-0">
											{suggestion.structured_formatting ? (
												<div>
													<div className="text-sm font-medium truncate">{suggestion.structured_formatting.main_text}</div>
													<div className="text-xs text-muted-foreground truncate">
														{suggestion.structured_formatting.secondary_text}
													</div>
												</div>
											) : (
												<div className="text-sm font-medium truncate">{suggestion.description}</div>
											)}
										</div>
									</div>
								</button>
							))}
						</div>,
						document.body
					)}

				{error && <p className="text-destructive text-sm">{error}</p>}
			</div>
		);
	}
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export default AddressAutocomplete;
