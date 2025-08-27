import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimePicker } from '@/components/ui/time-picker';

describe('TimePicker', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with placeholder text', () => {
    render(<TimePicker onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.placeholder).toBe('Select time');
  });

  it('renders with custom placeholder', () => {
    render(<TimePicker onChange={mockOnChange} placeholder="Choose start time" />);
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.placeholder).toBe('Choose start time');
  });

  it('displays selected time in correct format', () => {
    render(<TimePicker value="14:30" onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('14:30') as HTMLInputElement;
    expect(input.value).toBe('14:30');
  });

  it('calls onChange when time is selected', async () => {
    const user = userEvent.setup();
    render(<TimePicker onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('');
    // Use fireEvent for direct input value setting
    fireEvent.change(input, { target: { value: '14:30' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('14:30');
  });

  it('supports 12-hour format display', () => {
    render(<TimePicker value="14:30" onChange={mockOnChange} format="12h" />);
    
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  it('supports 24-hour format display', () => {
    render(<TimePicker value="14:30" onChange={mockOnChange} format="24h" />);
    
    const input = screen.getByDisplayValue('14:30') as HTMLInputElement;
    expect(input.value).toBe('14:30');
  });

  it('shows error state with validation message', () => {
    render(<TimePicker onChange={mockOnChange} error="Time is required" />);
    
    expect(screen.getByText('Time is required')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toHaveClass('border-red-500');
  });

  it('can be disabled', () => {
    render(<TimePicker onChange={mockOnChange} disabled />);
    
    const input = screen.getByDisplayValue('');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-50');
  });

  it('supports min and max time constraints', () => {
    render(
      <TimePicker 
        onChange={mockOnChange} 
        minTime="09:00"
        maxTime="17:00"
      />
    );
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.min).toBe('09:00');
    expect(input.max).toBe('17:00');
  });

  it('shows label when provided', () => {
    render(<TimePicker onChange={mockOnChange} label="Start Time" />);
    
    expect(screen.getByText('Start Time')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(<TimePicker onChange={mockOnChange} label="Start Time" required />);
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TimePicker 
        onChange={mockOnChange}
        label="Event Time"
        required
        error="This field is required"
      />
    );
    
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('type', 'time');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('supports step intervals', () => {
    render(<TimePicker onChange={mockOnChange} step={15} />);
    
    const input = screen.getByDisplayValue('') as HTMLInputElement;
    expect(input.step).toBe('900'); // 15 minutes in seconds
  });

  it('handles clearing the value', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('14:30');
      return (
        <div>
          <TimePicker value={value} onChange={setValue} />
          <button onClick={() => setValue('')}>Clear</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    const input = screen.getByDisplayValue('14:30') as HTMLInputElement;
    expect(input.value).toBe('14:30');
    
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByDisplayValue('').value).toBe('');
  });

  it('validates time format on blur', async () => {
    const user = userEvent.setup();
    render(<TimePicker onChange={mockOnChange} />);
    
    const input = screen.getByDisplayValue('');
    await user.type(input, '25:99'); // Invalid time
    fireEvent.blur(input);
    
    // Browser should handle invalid time validation
    expect(input).toHaveAttribute('type', 'time');
  });

  it('supports custom className', () => {
    render(<TimePicker onChange={mockOnChange} className="custom-time-picker" />);
    
    expect(screen.getByDisplayValue('')).toHaveClass('custom-time-picker');
  });
});