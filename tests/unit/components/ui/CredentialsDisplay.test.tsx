import { render, screen } from '@testing-library/react';
import { CredentialsDisplay } from '@/components/ui/CredentialsDisplay';

describe('CredentialsDisplay', () => {
  describe('Rendering and Content', () => {
    it('should render the credentials section with proper heading', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/credentials|certified|professional/i);
    });

    it('should display insurance certificate badge', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByText(/liability insurance/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1,000,000/i)).toBeInTheDocument();
    });

    it('should display professional association memberships', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByText(/national association/i)).toBeInTheDocument();
      expect(screen.getByText(/dj association/i)).toBeInTheDocument();
    });

    it('should display years of experience counter', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByText(/15\+ years/i)).toBeInTheDocument();
      expect(screen.getByText(/experience/i)).toBeInTheDocument();
    });

    it('should display equipment certification badges', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByText(/professional equipment/i)).toBeInTheDocument();
      expect(screen.getByText(/certified setup/i)).toBeInTheDocument();
    });

    it('should display COVID safety protocols', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByText(/covid.*safe/i)).toBeInTheDocument();
      expect(screen.getByText(/sanitization/i)).toBeInTheDocument();
    });
  });

  describe('Visual Design and Icons', () => {
    it('should render shield icons for insurance and certifications', () => {
      render(<CredentialsDisplay />);
      const shieldIcons = screen.getAllByTestId('shield-icon');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });

    it('should render checkmark icons for verified credentials', () => {
      render(<CredentialsDisplay />);
      const checkmarkIcons = screen.getAllByTestId('checkmark-icon');
      expect(checkmarkIcons.length).toBeGreaterThan(0);
    });

    it('should render star icons for experience and ratings', () => {
      render(<CredentialsDisplay />);
      const starIcons = screen.getAllByTestId('star-icon');
      expect(starIcons.length).toBeGreaterThan(0);
    });

    it('should apply proper brand styling classes', () => {
      render(<CredentialsDisplay />);
      const container = screen.getByTestId('credentials-container');
      expect(container).toHaveClass('bg-white');
      expect(container).toHaveClass('rounded-lg');
      expect(container).toHaveClass('shadow-lg');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for credential items', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByLabelText(/liability insurance certificate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/professional membership/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/years of experience/i)).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<CredentialsDisplay />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have meaningful alt text for credential icons', () => {
      render(<CredentialsDisplay />);
      expect(screen.getByAltText(/insurance certificate/i)).toBeInTheDocument();
      expect(screen.getByAltText(/professional certification/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<CredentialsDisplay />);
      const container = screen.getByTestId('credentials-container');
      expect(container).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout classes', () => {
      render(<CredentialsDisplay />);
      const gridContainer = screen.getByTestId('credentials-grid');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should have responsive text sizing', () => {
      render(<CredentialsDisplay />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-xl');
      expect(heading).toHaveClass('md:text-2xl');
      expect(heading).toHaveClass('lg:text-3xl');
    });

    it('should have responsive spacing', () => {
      render(<CredentialsDisplay />);
      const container = screen.getByTestId('credentials-container');
      expect(container).toHaveClass('p-4');
      expect(container).toHaveClass('md:p-6');
      expect(container).toHaveClass('lg:p-8');
    });
  });

  describe('Interaction States', () => {
    it('should have hover effects on credential items', () => {
      render(<CredentialsDisplay />);
      const credentialItems = screen.getAllByTestId('credential-item');
      credentialItems.forEach(item => {
        expect(item).toHaveClass('hover:shadow-md');
        expect(item).toHaveClass('transition-all');
        expect(item).toHaveClass('duration-300');
      });
    });

    it('should have focus states for accessibility', () => {
      render(<CredentialsDisplay />);
      const credentialItems = screen.getAllByTestId('credential-item');
      credentialItems.forEach(item => {
        expect(item).toHaveClass('focus:outline-none');
        expect(item).toHaveClass('focus:ring-2');
        expect(item).toHaveClass('focus:ring-brand-gold');
      });
    });
  });

  describe('Brand Consistency', () => {
    it('should use brand gold color for accents', () => {
      render(<CredentialsDisplay />);
      const goldAccents = screen.getAllByTestId('brand-gold-accent');
      expect(goldAccents.length).toBeGreaterThan(0);
      goldAccents.forEach(accent => {
        expect(accent).toHaveClass('text-brand-gold');
      });
    });

    it('should use brand charcoal for text', () => {
      render(<CredentialsDisplay />);
      const textElements = screen.getAllByTestId('brand-text');
      textElements.forEach(text => {
        expect(text).toHaveClass('text-brand-charcoal');
      });
    });
  });
});