import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '@/components/ui/file-upload';

// Mock file objects
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('FileUpload', () => {
  const mockOnChange = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area with default text', () => {
    render(<FileUpload onChange={mockOnChange} />);
    
    expect(screen.getByText('Click to upload files')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders with custom label and description', () => {
    render(
      <FileUpload 
        onChange={mockOnChange}
        label="Upload Event Photos"
        description="Share photos from similar events"
      />
    );
    
    expect(screen.getByText('Upload Event Photos')).toBeInTheDocument();
    expect(screen.getByText('Share photos from similar events')).toBeInTheDocument();
  });

  it('allows single file selection by default', async () => {
    render(<FileUpload onChange={mockOnChange} />);
    
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(false);
  });

  it('allows multiple files when configured', () => {
    render(<FileUpload onChange={mockOnChange} multiple />);
    
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it('accepts specified file types', () => {
    render(<FileUpload onChange={mockOnChange} accept="image/*,application/pdf" />);
    
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('image/*,application/pdf');
  });

  it('handles file selection and calls onChange', async () => {
    const user = userEvent.setup();
    render(<FileUpload onChange={mockOnChange} />);
    
    const file = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(mockOnChange).toHaveBeenCalledWith([file]);
  });

  it('handles multiple file selection', async () => {
    const user = userEvent.setup();
    render(<FileUpload onChange={mockOnChange} multiple />);
    
    const file1 = createMockFile('test1.jpg', 1024 * 1024, 'image/jpeg');
    const file2 = createMockFile('test2.jpg', 2 * 1024 * 1024, 'image/jpeg');
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, [file1, file2]);
    
    expect(mockOnChange).toHaveBeenCalledWith([file1, file2]);
  });

  it('enforces maximum file size', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload 
        onChange={mockOnChange} 
        onError={mockOnError}
        maxSize={1024 * 1024} // 1MB
      />
    );
    
    const file = createMockFile('large.jpg', 2 * 1024 * 1024, 'image/jpeg'); // 2MB
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    expect(mockOnError).toHaveBeenCalledWith('File "large.jpg" is too large. Maximum size is 1 MB.');
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('enforces maximum number of files', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload 
        onChange={mockOnChange}
        onError={mockOnError}
        multiple
        maxFiles={2}
      />
    );
    
    const files = [
      createMockFile('file1.jpg', 1024, 'image/jpeg'),
      createMockFile('file2.jpg', 1024, 'image/jpeg'),
      createMockFile('file3.jpg', 1024, 'image/jpeg'),
    ];
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, files);
    
    expect(mockOnError).toHaveBeenCalledWith('Maximum 2 files allowed.');
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('validates file types', async () => {
    const TestComponent = () => {
      return (
        <FileUpload 
          onChange={mockOnChange}
          onError={mockOnError}
          accept="image/*"
        />
      );
    };
    
    render(<TestComponent />);
    
    const file = createMockFile('document.pdf', 1024, 'application/pdf');
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    // Simulate file input change event directly
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    expect(mockOnError).toHaveBeenCalledWith('File "document.pdf" type is not allowed.');
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows upload progress when provided', async () => {
    render(<FileUpload onChange={mockOnChange} progress={65} />);
    
    expect(screen.getByText('65%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays selected files', async () => {
    const TestComponent = () => {
      const [files, setFiles] = React.useState<File[]>([]);
      return <FileUpload onChange={setFiles} files={files} multiple />;
    };
    
    const user = userEvent.setup();
    render(<TestComponent />);
    
    const files = [
      createMockFile('photo1.jpg', 1024 * 1024, 'image/jpeg'),
      createMockFile('photo2.png', 2 * 1024 * 1024, 'image/png'),
    ];
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, files);
    
    await waitFor(() => {
      expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
      expect(screen.getByText('photo2.png')).toBeInTheDocument();
      expect(screen.getByText('1 MB')).toBeInTheDocument();
      expect(screen.getByText('2 MB')).toBeInTheDocument();
    });
  });

  it('allows removing selected files', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const [files, setFiles] = React.useState<File[]>([]);
      return (
        <FileUpload 
          onChange={setFiles}
          files={files}
          multiple
        />
      );
    };
    
    render(<TestComponent />);
    
    const file = createMockFile('photo.jpg', 1024, 'image/jpeg');
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    });
    
    const removeButton = screen.getByRole('button', { name: /remove.*photo\.jpg/i });
    await user.click(removeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('photo.jpg')).not.toBeInTheDocument();
    });
  });

  it('supports drag and drop', async () => {
    render(<FileUpload onChange={mockOnChange} />);
    
    const dropZone = screen.getByRole('button');
    const file = createMockFile('dropped.jpg', 1024, 'image/jpeg');
    
    fireEvent.dragEnter(dropZone);
    expect(dropZone).toHaveClass('border-brand-gold'); // Should show drag state
    
    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [file] }
    });
    
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] }
    });
    
    expect(mockOnChange).toHaveBeenCalledWith([file]);
  });

  it('shows error state when error prop is provided', () => {
    render(
      <FileUpload 
        onChange={mockOnChange} 
        error="Upload failed. Please try again."
      />
    );
    
    expect(screen.getByText('Upload failed. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('border-red-500');
  });

  it('can be disabled', () => {
    render(<FileUpload onChange={mockOnChange} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
    
    const input = button.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<FileUpload onChange={mockOnChange} loading />);
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('cursor-not-allowed');
  });

  it('has proper accessibility attributes', () => {
    render(
      <FileUpload 
        onChange={mockOnChange}
        label="Event Photos"
        required
        error="This field is required"
      />
    );
    
    const input = screen.getByRole('button').querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    
    expect(screen.getByText('Event Photos')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    const TestComponent = () => {
      const [files] = React.useState<File[]>([
        createMockFile('small.txt', 512, 'text/plain'),
        createMockFile('medium.jpg', 1024 * 1024, 'image/jpeg'),
        createMockFile('large.pdf', 1024 * 1024 * 1024, 'application/pdf'),
      ]);
      return <FileUpload onChange={() => {}} files={files} multiple />;
    };
    
    render(<TestComponent />);
    
    expect(screen.getByText('512 B')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByText('1 GB')).toBeInTheDocument();
  });
});