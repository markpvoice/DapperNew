import { render, screen } from '@testing-library/react';
import { GuaranteeBadges } from '@/components/ui/GuaranteeBadges';

describe('GuaranteeBadges', () => {
  describe('Rendering and Content', () => {
    it('should render the guarantee section with proper heading', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/guarantee|promise|commitment/i);
    });

    it('should display satisfaction guarantee badge', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
      expect(screen.getByText(/satisfaction/i)).toBeInTheDocument();
      expect(screen.getByText(/guaranteed/i)).toBeInTheDocument();
    });

    it('should display money-back guarantee', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByText(/money.*back/i)).toBeInTheDocument();
      expect(screen.getByText(/30.*day/i)).toBeInTheDocument();
    });

    it('should display equipment backup policy', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByText(/backup.*equipment/i)).toBeInTheDocument();
      expect(screen.getByText(/always.*ready/i)).toBeInTheDocument();
    });

    it('should display clear cancellation policy', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByText(/cancellation.*policy/i)).toBeInTheDocument();
      expect(screen.getByText(/24.*hour/i)).toBeInTheDocument();
    });

    it('should display professional service guarantee', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByText(/professional.*service/i)).toBeInTheDocument();
      expect(screen.getByText(/licensed.*insured/i)).toBeInTheDocument();
    });

    it('should display punctuality guarantee', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByText(/on.*time/i)).toBeInTheDocument();
      expect(screen.getByText(/punctuality/i)).toBeInTheDocument();
    });
  });

  describe('Visual Design and Icons', () => {
    it('should render shield icons for guarantees', () => {
      render(<GuaranteeBadges />);
      const shieldIcons = screen.getAllByTestId('shield-guarantee-icon');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });

    it('should render checkmark icons for verified guarantees', () => {
      render(<GuaranteeBadges />);
      const checkmarkIcons = screen.getAllByTestId('checkmark-guarantee-icon');
      expect(checkmarkIcons.length).toBeGreaterThan(0);
    });

    it('should render star icons for quality guarantees', () => {
      render(<GuaranteeBadges />);
      const starIcons = screen.getAllByTestId('star-guarantee-icon');
      expect(starIcons.length).toBeGreaterThan(0);
    });

    it('should apply proper guarantee badge styling', () => {
      render(<GuaranteeBadges />);
      const container = screen.getByTestId('guarantees-container');
      expect(container).toHaveClass('bg-gradient-to-r');
      expect(container).toHaveClass('from-brand-gold');
      expect(container).toHaveClass('to-yellow-400');
      expect(container).toHaveClass('rounded-lg');
      expect(container).toHaveClass('shadow-xl');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for guarantee items', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByLabelText(/satisfaction guarantee/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/money back guarantee/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/equipment backup guarantee/i)).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<GuaranteeBadges />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have meaningful alt text for guarantee icons', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByAltText(/satisfaction guarantee shield/i)).toBeInTheDocument();
      expect(screen.getByAltText(/money back guarantee/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<GuaranteeBadges />);
      const container = screen.getByTestId('guarantees-container');
      expect(container).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout classes', () => {
      render(<GuaranteeBadges />);
      const gridContainer = screen.getByTestId('guarantees-grid');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('sm:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should have responsive text sizing', () => {
      render(<GuaranteeBadges />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveClass('text-lg');
      expect(heading).toHaveClass('md:text-xl');
      expect(heading).toHaveClass('lg:text-2xl');
    });

    it('should have responsive spacing', () => {
      render(<GuaranteeBadges />);
      const container = screen.getByTestId('guarantees-container');
      expect(container).toHaveClass('p-3');
      expect(container).toHaveClass('md:p-4');
      expect(container).toHaveClass('lg:p-6');
    });
  });

  describe('Interaction States', () => {
    it('should have hover effects on guarantee badges', () => {
      render(<GuaranteeBadges />);
      const guaranteeItems = screen.getAllByTestId('guarantee-badge');
      guaranteeItems.forEach(item => {
        expect(item).toHaveClass('hover:scale-105');
        expect(item).toHaveClass('hover:shadow-lg');
        expect(item).toHaveClass('transition-all');
        expect(item).toHaveClass('duration-300');
      });
    });

    it('should have focus states for accessibility', () => {
      render(<GuaranteeBadges />);
      const guaranteeItems = screen.getAllByTestId('guarantee-badge');
      guaranteeItems.forEach(item => {
        expect(item).toHaveClass('focus:outline-none');
        expect(item).toHaveClass('focus:ring-2');
        expect(item).toHaveClass('focus:ring-white');
      });
    });
  });

  describe('Trust Building Elements', () => {
    it('should display specific guarantee percentages and timeframes', () => {
      render(<GuaranteeBadges />);
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
      expect(screen.getByText(/30.*day/i)).toBeInTheDocument();
      expect(screen.getByText(/24.*hour/i)).toBeInTheDocument();
    });

    it('should use confident and reassuring language', () => {
      render(<GuaranteeBadges />);
      expect(screen.getAllByText(/guaranteed/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/promise/i)).toBeInTheDocument();
      expect(screen.getByText(/commitment/i)).toBeInTheDocument();
    });

    it('should highlight key trust elements', () => {
      render(<GuaranteeBadges />);
      const trustElements = screen.getAllByTestId('trust-element');
      expect(trustElements.length).toBeGreaterThan(0);
      trustElements.forEach(element => {
        expect(element).toHaveClass('font-bold');
        expect(element).toHaveClass('text-white');
      });
    });
  });

  describe('Brand Consistency', () => {
    it('should use white text on gold background for contrast', () => {
      render(<GuaranteeBadges />);
      const whiteText = screen.getAllByTestId('white-text');
      whiteText.forEach(text => {
        expect(text).toHaveClass('text-white');
      });
    });

    it('should maintain proper contrast ratios', () => {
      render(<GuaranteeBadges />);
      const container = screen.getByTestId('guarantees-container');
      expect(container).toHaveClass('text-white');
    });
  });
});