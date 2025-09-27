import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { responsiveClasses } from "@/lib/utils/responsive";
import { useDebounce } from "@/hooks/useDebounce";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

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
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value = "",
  onChange,
  onPlaceSelected,
  placeholder = "Enter address...",
  label,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary("places");

  const autocompleteService = useMemo(
    () => placesLib && new placesLib.AutocompleteService(),
    [placesLib]
  );

  const placesService = useMemo(() => {
    if (placesLib) {
      const dummyDiv = document.createElement("div");
      return new placesLib.PlacesService(dummyDiv);
    }
    return null;
  }, [placesLib]);

  // Update internal state when value prop changes
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
      const request = {
        input,
        types: ["address"],
        componentRestrictions: { country: "uk" },
      };

      autocompleteService.getPlacePredictions(
        request,
        (predictions, status) => {
          setIsLoading(false);

          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            const mappedSuggestions: AddressSuggestion[] = predictions.map(
              (prediction) => ({
                placeId: prediction.place_id,
                description: prediction.description,
                structured_formatting: prediction.structured_formatting,
              })
            );
            setSuggestions(mappedSuggestions);
            setIsOpen(true);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        }
      );
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

    // Get place details if callback provided
    if (onPlaceSelected && placesService) {
      const request = {
        placeId: suggestion.placeId,
        fields: ["formatted_address", "geometry", "name", "place_id"],
      };

      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          onPlaceSelected(place);
        }
      });
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    onChange?.("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const baseInputClasses =
    "input input-bordered w-full pr-10 transition-colors duration-200";
  const errorClasses = error ? "input-error border-red-500" : "";
  const disabledClasses = disabled ? "input-disabled opacity-60" : "";

  const inputClasses = [
    baseInputClasses,
    errorClasses,
    disabledClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClasses = [
    "block font-medium mb-2",
    responsiveClasses.text.label,
    error ? "text-red-600" : "text-base-content",
    disabled ? "opacity-60" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-control w-full relative isolate">
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <FaMapMarkerAlt className="text-base-content/60" size={16} />
        </div>

        <input
          ref={inputRef}
          type="text"
          className={`${inputClasses} pl-10`}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />

        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/60 hover:text-base-content z-10"
          >
            <FaTimes size={12} />
          </button>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="loading loading-spinner loading-sm"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[141414] border border-base-300 rounded-lg shadow-lg max-h-60 overflow-auto" style={{ zIndex: 999999 }}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-base-200 focus:bg-base-200 focus:outline-none border-b border-base-300 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt
                  className="text-primary mt-1 flex-shrink-0"
                  size={14}
                />
                <div className="flex-1 min-w-0">
                  {suggestion.structured_formatting ? (
                    <div>
                      <div className="font-medium text-base-content truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-sm text-base-content/70 truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  ) : (
                    <div className="font-medium text-base-content">
                      {suggestion.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-1 text-red-600">
          <span className={responsiveClasses.text.caption}>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
