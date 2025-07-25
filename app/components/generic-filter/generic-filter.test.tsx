import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GenericFilter, { type FilterOption } from './generic-filter';

const mockOptions: FilterOption<string>[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('GenericFilter', () => {
  const mockOnValueChange = vi.fn();
  
  beforeEach(() => {
    mockOnValueChange.mockClear();
  });

  it('renders the filter label and dropdown button', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="option1"
        onValueChange={mockOnValueChange}
        options={mockOptions}
      />
    );
    
    expect(screen.getByText('Test Filter')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the selected option in the dropdown button', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="option2"
        onValueChange={mockOnValueChange}
        options={mockOptions}
      />
    );
    
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('shows placeholder when no option is selected', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="nonexistent"
        onValueChange={mockOnValueChange}
        options={mockOptions}
        placeholder="Select an option"
      />
    );
    
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="option1"
        onValueChange={mockOnValueChange}
        options={mockOptions}
      />
    );
    
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    // All options should now be visible
    expect(screen.getAllByText('Option 1')).toHaveLength(2); // One in button, one in dropdown
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('closes dropdown and calls onValueChange when option is selected', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="option1"
        onValueChange={mockOnValueChange}
        options={mockOptions}
      />
    );
    
    // Open dropdown
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    // Click on an option in the dropdown
    const option2 = screen.getByText('Option 2');
    fireEvent.click(option2);
    
    expect(mockOnValueChange).toHaveBeenCalledWith('option2');
    
    // Dropdown should be closed (Option 2 should not be visible in dropdown anymore)
    expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
  });

  it('highlights the selected option in the dropdown', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="option2"
        onValueChange={mockOnValueChange}
        options={mockOptions}
      />
    );
    
    // Open dropdown
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    // Find the selected option in the dropdown
    const dropdownOptions = screen.getAllByText('Option 2');
    const selectedOption = dropdownOptions.find(option => 
      option.closest('button')?.classList.contains('bg-gray-100')
    );
    
    expect(selectedOption?.closest('button')).toHaveClass('bg-gray-100', 'text-gray-900', 'font-medium');
  });

  it('works with different value types', () => {
    const numberOptions: FilterOption<number>[] = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
      { value: 3, label: 'Three' },
    ];

    const mockOnNumberChange = vi.fn();

    render(
      <GenericFilter<number>
        label="Number Filter"
        selectedValue={2}
        onValueChange={mockOnNumberChange}
        options={numberOptions}
      />
    );
    
    expect(screen.getByText('Two')).toBeInTheDocument();
    
    // Open dropdown and select option
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    const option3 = screen.getByText('Three');
    fireEvent.click(option3);
    
    expect(mockOnNumberChange).toHaveBeenCalledWith(3);
  });

  it('applies custom className', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="option1"
        onValueChange={mockOnValueChange}
        options={mockOptions}
        className="custom-class"
      />
    );
    
    // The className is applied to the outermost div
    const container = screen.getByText('Test Filter').closest('div')?.parentElement?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(
      <GenericFilter
        label="Test Filter"
        selectedValue="option1"
        onValueChange={mockOnValueChange}
        options={mockOptions}
      />
    );
    
    const dropdownButton = screen.getByRole('button');
    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
    
    // Open dropdown
    fireEvent.click(dropdownButton);
    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <GenericFilter
          label="Test Filter"
          selectedValue="option1"
          onValueChange={mockOnValueChange}
          options={mockOptions}
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    // Open dropdown
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    
    // Click on the overlay (which closes the dropdown)
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
  });
});
