import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface FilterOption<T = string> {
  value: T;
  label: string;
}

interface GenericFilterProps<T = string> {
  label: string;
  selectedValue: T;
  onValueChange: (value: T) => void;
  options: FilterOption<T>[];
  placeholder?: string;
  className?: string;
}

export default function GenericFilter<T = string>({ 
  label, 
  selectedValue, 
  onValueChange, 
  options, 
  placeholder = "Select option",
  className = ""
}: GenericFilterProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find(option => option.value === selectedValue);
  const selectedLabel = selectedOption?.label || placeholder;

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = Math.min(240, options.length * 40); // Estimate dropdown height
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Position dropdown above button if not enough space below
      const shouldPositionAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
      
      // Use viewport coordinates since we're using position: fixed
      setDropdownPosition({
        top: shouldPositionAbove 
          ? rect.top - dropdownHeight - 4
          : rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen, options.length]);

  return (
    <div className={`w-full px-4 mb-6 ${className}`}>
      <div className="flex justify-center">
        <div className="relative z-[100]">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            {label}
          </label>
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            className="
              flex items-center justify-between
              px-4 py-2 md:px-6 md:py-3
              bg-white border border-gray-300
              rounded-md shadow-sm
              text-sm md:text-base font-medium text-gray-700
              hover:border-gray-400 hover:bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500
              transition-colors duration-200
              min-w-[120px] md:min-w-[140px]
            "
          >
            <span>{selectedLabel}</span>
            <svg
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

        </div>
      </div>

      {/* Portal-based dropdown to avoid z-index issues */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown menu */}
          <div 
            className="
              fixed bg-white border border-gray-300 rounded-lg shadow-lg
              z-[99999] max-h-60 overflow-y-auto
            "
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
            {options.map((option) => (
              <button
                key={String(option.value)}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm md:text-base
                  hover:bg-gray-50 transition-colors duration-150
                  first:rounded-t-lg last:rounded-b-lg
                  ${
                    selectedValue === option.value
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-700'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
