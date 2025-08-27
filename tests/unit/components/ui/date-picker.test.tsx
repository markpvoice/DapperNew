import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '@/components/ui/date-picker';

describe('DatePicker', () => {
  const mockOnChange = jest.fn();
  const today = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the current date for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with placeholder text', () => {
    render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.placeholder).toBe('Select date');
  });

  it('renders with custom placeholder', () => {
    render(<DatePicker onChange={mockOnChange} placeholder="Choose event date" />);
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.placeholder).toBe('Choose event date');
  });

  it('displays selected date in correct format', () => {
    const selectedDate = '2024-12-25';
    render(<DatePicker value={selectedDate} onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue(selectedDate) as HTMLInputElement;
    expect(input.value).toBe(selectedDate);
  });

  it('calls onChange when date is selected', () => {
    render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('');
    fireEvent.change(input, { target: { value: '2024-12-25' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('2024-12-25');
  });

  it('prevents selection of past dates when minDate is today', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const minDate = today.toISOString().split('T')[0];
    
    render(<DatePicker onChange={mockOnChange} minDate={minDate} />);
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.min).toBe(minDate);
  });

  it('prevents selection beyond maxDate', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const maxDate = futureDate.toISOString().split('T')[0];
    
    render(<DatePicker onChange={mockOnChange} maxDate={maxDate} />);
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.max).toBe(maxDate);
  });

  it('shows error state when error prop is provided', () => {
    render(<DatePicker onChange={mockOnChange} error="Invalid date" />);
    
    const input = screen.getByDisplayValue('');
    expect(input).toHaveClass('border-red-500');
    expect(screen.getByText('Invalid date')).toBeInTheDocument();
  });

  it('shows required validation error', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<DatePicker onChange={mockOnChange} required error="Date is required" />);
    
    expect(screen.getByText('Date is required')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toHaveClass('border-red-500');
  });

  it('can be disabled', () => {
    render(<DatePicker onChange={mockOnChange} disabled />);
    
    const input = screen.getByDisplayValue('');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-50');
  });

  it('supports custom className', () => {
    render(<DatePicker onChange={mockOnChange} className="custom-class" />);
    
    expect(screen.getByDisplayValue('')).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(
      <DatePicker 
        onChange={mockOnChange} 
        label="Event Date"
        required
        error="This field is required"
      />
    );
    
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('type', 'date');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    expect(screen.getByText('Event Date')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<DatePicker onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    
    // Should be focused
    expect(input).toHaveFocus();
  });

  it('clears value when clear function is called', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('2024-12-25');
      return (
        <div>
          <DatePicker value={value} onChange={setValue} />
          <button onClick={() => setValue('')}>Clear</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    const input = screen.getByDisplayValue('2024-12-25') as HTMLInputElement;
    expect(input.value).toBe('2024-12-25');
    
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByDisplayValue('').value).toBe('');
  });
});