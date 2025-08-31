import { useState, useRef, useEffect } from 'react';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find(option => option.value === selectedValue);
  const selectedLabel = selectedOption?.label || placeholder;

  return (
    <div className={`w-full px-4 mb-6 ${className}`}>
      <div className="flex justify-center">
        <div className="relative">
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

          {isOpen && (
            <div 
              className="
                absolute top-full left-0 right-0 mt-1
                bg-white border border-gray-300 rounded-lg shadow-lg
                z-[9999] max-h-60 overflow-y-auto
              "
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
          )}
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
