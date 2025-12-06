import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import type { FieldError } from "react-hook-form";
import { createPortal } from "react-dom";

interface AutocompleteOption {
  value: string;
  label: string;
}

interface AutocompleteProps {
  label: string;
  options: AutocompleteOption[];
  value?: string;
  onChange: (value: string) => void;
  onAddNew?: () => void;
  placeholder?: string;
  error?: FieldError | string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  disabled?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  options,
  value,
  onChange,
  onAddNew,
  placeholder = "Type to search...",
  error,
  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  errorClassName = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log(options)



  const errorMessage = typeof error === "string" ? error : error?.message;

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = isOpen ? searchQuery : selectedOption?.label || "";

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );


  console.log(filteredOptions)

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== "Escape") {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 + (onAddNew ? 1 : 0)
            ? prev + 1
            : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (onAddNew && highlightedIndex === filteredOptions.length) {
          handleAddNew();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleAddNew = () => {
    setIsOpen(false);
    setSearchQuery("");
    if (onAddNew) {
      onAddNew();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(0);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const baseInputClasses = `
    w-full px-4 py-2 border rounded-lg pr-10
    focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    transition-colors duration-200
    ${error ? "border-red-500" : "border-gray-300"}
    ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-text"}
  `;

  const baseLabelClasses = `
    block text-sm font-medium mb-2 text-gray-700
  `;

  const baseErrorClasses = `
    text-red-500 text-sm mt-1
  `;

  // Render dropdown using portal for proper z-index
  const renderDropdown = () => {
    if (!isOpen || disabled) return null;

    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: `${dropdownPosition.top + 4}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 9999,
        }}
        className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        {filteredOptions.length > 0 ? (
          [...filteredOptions.splice(0, 3)].map((option, index) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                highlightedIndex === index
                  ? "bg-indigo-50 text-indigo-900"
                  : "hover:bg-gray-50"
              } ${value === option.value ? "bg-indigo-100 font-medium" : ""}`}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </div>
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500 italic">
            No residents found
          </div>
        )}

        {onAddNew && (
          <div
            onClick={handleAddNew}
            className={`px-4 py-2 cursor-pointer border-t border-gray-200 flex items-center gap-2 transition-colors ${
              highlightedIndex === filteredOptions.length
                ? "bg-green-50 text-green-900"
                : "hover:bg-gray-50 text-green-600"
            }`}
            onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add New Resident</span>
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div className={containerClassName}>
      <label className={`${baseLabelClasses} ${labelClassName}`}>{label}</label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInputClasses} ${inputClassName}`}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded pointer-events-auto"
              tabIndex={-1}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {renderDropdown()}
      </div>

      {errorMessage && (
        <p className={`${baseErrorClasses} ${errorClassName}`}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Autocomplete;
