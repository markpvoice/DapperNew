/**
 * @fileoverview TDD Unit Tests for Booking Confirmation Email Template
 * 
 * Testing email templates to ensure correct rendering and content
 * Following TDD: Write tests -> Implement email template -> Refactor
 */

import { render } from '@react-email/render';
import { BookingConfirmationEmail } from '@/emails/booking-confirmation';

describe.skip('Booking Confirmation Email Template', () => {
  const mockBookingData = {
    clientName: 'John Doe',
    bookingReference: 'DSE-123456-ABC',
    eventDate: 'December 25, 2024',
    eventType: 'Wedding',
    services: ['DJ', 'Photography'],
    venueName: 'Grand Ballroom',
    venueAddress: '123 Main St, Chicago, IL 60601',
    totalAmount: 2500,
    depositAmount: 500,
    paymentLink: 'https://stripe.com/payment/test-link',
    calendarLink: 'https://calendar.google.com/calendar/render?action=TEMPLATE',
  };

  describe('Email Content Rendering', () => {
    it('should render email with all booking details', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('Booking Confirmed! 🎉');
      expect(html).toContain('John Doe');
      expect(html).toContain('DSE-123456-ABC');
      expect(html).toContain('December 25, 2024');
      expect(html).toContain('Wedding');
      expect(html).toContain('DJ');
      expect(html).toContain('Photography');
      expect(html).toContain('Grand Ballroom');
      expect(html).toContain('123 Main St, Chicago, IL 60601');
    });

    it('should display pricing information correctly', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('$2,500.00'); // Total amount
      expect(html).toContain('$500.00');   // Deposit amount
      expect(html).toContain('Total Amount');
      expect(html).toContain('Deposit Required');
    });

    it('should include payment link when provided', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('Pay Deposit Now');
      expect(html).toContain('href="https://stripe.com/payment/test-link"');
    });

    it('should include calendar link when provided', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('Add to Calendar');
      expect(html).toContain('href="https://calendar.google.com/calendar/render?action=TEMPLATE"');
    });

    it('should render without optional fields', () => {
      // Arrange
      const minimalData = {
        clientName: 'Jane Smith',
        bookingReference: 'DSE-789012-DEF',
        eventDate: 'June 15, 2024',
        eventType: 'Corporate Event',
        services: ['DJ'],
      };

      // Act
      const html = render(<BookingConfirmationEmail {...minimalData} />);
      
      // Assert
      expect(html).toContain('Jane Smith');
      expect(html).toContain('DSE-789012-DEF');
      expect(html).toContain('Corporate Event');
      expect(html).toContain('DJ');
      
      // Should not contain optional fields
      expect(html).not.toContain('Grand Ballroom');
      expect(html).not.toContain('Pay Deposit Now');
    });
  });

  describe('Service-Specific Content', () => {
    it('should show DJ-specific information when DJ service is selected', () => {
      // Arrange
      const djBooking = {
        ...mockBookingData,
        services: ['DJ'],
      };

      // Act
      const html = render(<BookingConfirmationEmail {...djBooking} />);
      
      // Assert
      expect(html).toContain('🎧 DJ Services:');
      expect(html).toContain('Professional sound system and lighting');
      expect(html).toContain('Our DJ will arrive 2 hours before your event');
      expect(html).toContain('Music requests can be submitted up to 1 week before');
    });

    it('should show Photography-specific information when Photography service is selected', () => {
      // Arrange
      const photoBooking = {
        ...mockBookingData,
        services: ['Photography'],
      };

      // Act
      const html = render(<BookingConfirmationEmail {...photoBooking} />);
      
      // Assert
      expect(html).toContain('📸 Photography Services:');
      expect(html).toContain('Professional event photographer');
      expect(html).toContain('High-resolution photos delivered within 48 hours');
      expect(html).toContain('Online gallery for easy sharing');
    });

    it('should show Karaoke-specific information when Karaoke service is selected', () => {
      // Arrange
      const karaokeBooking = {
        ...mockBookingData,
        services: ['Karaoke'],
      };

      // Act
      const html = render(<BookingConfirmationEmail {...karaokeBooking} />);
      
      // Assert
      expect(html).toContain('🎤 Karaoke Services:');
      expect(html).toContain('Professional karaoke system with wireless microphones');
      expect(html).toContain('Library of 10,000+ songs');
      expect(html).toContain('Dedicated karaoke host');
    });

    it('should show multiple service information when multiple services are selected', () => {
      // Arrange
      const multiServiceBooking = {
        ...mockBookingData,
        services: ['DJ', 'Photography', 'Karaoke'],
      };

      // Act
      const html = render(<BookingConfirmationEmail {...multiServiceBooking} />);
      
      // Assert
      expect(html).toContain('🎧 DJ Services:');
      expect(html).toContain('📸 Photography Services:');
      expect(html).toContain('🎤 Karaoke Services:');
    });
  });

  describe('Email Structure and Branding', () => {
    it('should include Dapper Squad branding elements', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('Dapper Squad Entertainment');
      expect(html).toContain('Making every event legendary');
      expect(html).toContain('Professional DJ, Karaoke & Photography Services');
      expect(html).toContain('Chicago-Milwaukee Area');
    });

    it('should include contact information', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('(555) 123-4567');
      expect(html).toContain('bookings@dappersquad.com');
      expect(html).toContain('www.dappersquad.com');
    });

    it('should include social media links', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('facebook.com/dappersquad');
      expect(html).toContain('instagram.com/dappersquad');
      expect(html).toContain('twitter.com/dappersquad');
    });

    it('should have proper HTML structure', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('<!DOCTYPE html');
      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toContain('<body');
      expect(html).toContain('</html>');
    });
  });

  describe('Accessibility and Compatibility', () => {
    it('should include alt text for images', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('alt="Dapper Squad Entertainment"');
    });

    it('should use table-based layout for email client compatibility', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('<table');
      expect(html).toContain('<tr>');
      expect(html).toContain('<td>');
    });

    it('should include inline CSS for better email client support', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('style=');
      // Should have inline styles for better compatibility
    });

    it('should be responsive for mobile email clients', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('max-width');
      expect(html).toContain('width: 100%');
    });
  });

  describe('Call-to-Action Buttons', () => {
    it('should render payment button with correct styling', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('Pay Deposit Now');
      expect(html).toContain('background-color: #FFD700'); // Brand gold color
      expect(html).toContain('color: #2C2C2C'); // Brand charcoal color
      expect(html).toContain('text-decoration: none');
    });

    it('should render calendar button with correct styling', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('Add to Calendar');
      expect(html).toContain('background-color: #6C757D'); // Secondary color
      expect(html).toContain('color: #ffffff');
    });

    it('should not render payment button when no payment link provided', () => {
      // Arrange
      const dataWithoutPayment = {
        ...mockBookingData,
        paymentLink: undefined,
      };

      // Act
      const html = render(<BookingConfirmationEmail {...dataWithoutPayment} />);
      
      // Assert
      expect(html).not.toContain('Pay Deposit Now');
    });

    it('should not render calendar button when no calendar link provided', () => {
      // Arrange
      const dataWithoutCalendar = {
        ...mockBookingData,
        calendarLink: undefined,
      };

      // Act
      const html = render(<BookingConfirmationEmail {...dataWithoutCalendar} />);
      
      // Assert
      expect(html).not.toContain('Add to Calendar');
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should handle missing client name gracefully', () => {
      // Arrange
      const dataWithoutName = {
        ...mockBookingData,
        clientName: '',
      };

      // Act & Assert
      expect(() => {
        render(<BookingConfirmationEmail {...dataWithoutName} />);
      }).not.toThrow();
    });

    it('should handle empty services array', () => {
      // Arrange
      const dataWithoutServices = {
        ...mockBookingData,
        services: [],
      };

      // Act
      const html = render(<BookingConfirmationEmail {...dataWithoutServices} />);
      
      // Assert
      expect(html).toContain('John Doe'); // Should still render other content
      expect(html).not.toContain('🎧 DJ Services:');
    });

    it('should handle extremely long venue names', () => {
      // Arrange
      const dataWithLongVenue = {
        ...mockBookingData,
        venueName: 'A'.repeat(200) + ' Very Long Venue Name That Might Break Email Layout',
      };

      // Act
      const html = render(<BookingConfirmationEmail {...dataWithLongVenue} />);
      
      // Assert
      expect(html).toContain('A'.repeat(200));
      expect(html).toContain('<table'); // Should maintain structure
    });

    it('should format currency values correctly', () => {
      // Arrange
      const dataWithVariousPrices = {
        ...mockBookingData,
        totalAmount: 1234.56,
        depositAmount: 250.00,
      };

      // Act
      const html = render(<BookingConfirmationEmail {...dataWithVariousPrices} />);
      
      // Assert
      expect(html).toContain('$1,234.56');
      expect(html).toContain('$250.00');
    });
  });

  describe('Preview Text', () => {
    it('should generate appropriate preview text', () => {
      // Arrange & Act
      const html = render(<BookingConfirmationEmail {...mockBookingData} />);
      
      // Assert
      expect(html).toContain('Booking confirmed for December 25, 2024 - DSE-123456-ABC');
    });
  });

  describe('Performance', () => {
    it('should render email template efficiently', () => {
      // Arrange
      const startTime = performance.now();

      // Act
      render(<BookingConfirmationEmail {...mockBookingData} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Assert
      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('should handle multiple concurrent renders', () => {
      // Arrange
      const promises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(render(<BookingConfirmationEmail 
          {...mockBookingData} 
          clientName={`Client ${i}`}
        />))
      );

      // Act & Assert
      expect(Promise.all(promises)).resolves.toHaveLength(10);
    });
  });
});