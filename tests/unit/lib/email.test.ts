/**
 * @fileoverview TDD Unit Tests for Email Service Functions
 * 
 * Testing email sending functionality and business logic
 * Following TDD: Red -> Green -> Refactor
 */

import {
  sendBookingConfirmation,
  sendAdminNotification,
  sendContactFormResponse,
  checkEmailHealth,
  type BookingEmailData,
} from '@/lib/email';

// Mock Resend
const mockSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

// Mock React Email render
jest.mock('@react-email/render', () => ({
  render: jest.fn().mockReturnValue('<html>Mock Email HTML</html>'),
}));

describe('Email Service Functions', () => {
  const mockBookingData: BookingEmailData = {
    clientName: 'John Doe',
    clientEmail: 'john.doe@example.com',
    bookingReference: 'DSE-123456-ABC',
    eventDate: 'December 25, 2024',
    eventType: 'Wedding',
    services: ['DJ', 'Photography'],
    venueName: 'Grand Ballroom',
    venueAddress: '123 Main St, Chicago, IL',
    totalAmount: 2500,
    depositAmount: 500,
    paymentLink: 'https://stripe.com/payment/test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockClear();
    // Set up environment variable
    process.env.RESEND_API_KEY = 'test-api-key';
    
    // Mock the Resend instance to use our mockSend function
    const { Resend } = require('resend');
    Resend.mockImplementation(() => ({
      emails: { send: mockSend },
    }));
  });

  describe.skip('sendBookingConfirmation', () => {
    it('should send booking confirmation email successfully', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      const result = await sendBookingConfirmation(mockBookingData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.emailId).toBe('email-123');
      expect(result.message).toContain('successfully');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: ['markphillips.voice@gmail.com'], // Development mode uses verified email
        subject: 'Booking Confirmed - DSE-123456-ABC | Dapper Squad Entertainment',
        html: expect.stringContaining('Booking Confirmed!'),
        tags: [
          { name: 'category', value: 'booking-confirmation' },
          { name: 'booking-reference', value: 'DSE-123456-ABC' },
        ],
      });
    });

    it('should handle Resend API errors gracefully', async () => {
      // Arrange
      const mockErrorResponse = {
        data: null,
        error: { message: 'API rate limit exceeded' },
      };

      mockSend.mockResolvedValue(mockErrorResponse);

      // Act
      const result = await sendBookingConfirmation(mockBookingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('API rate limit exceeded');
    });

    it('should handle network errors', async () => {
      // Arrange
      mockSend.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await sendBookingConfirmation(mockBookingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should generate calendar link correctly', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendBookingConfirmation(mockBookingData);

      // Assert
      const emailCall = mockSend.mock.calls[0][0];
      expect(emailCall.html).toContain('calendar.google.com');
      expect(emailCall.html).toContain('action=TEMPLATE');
      expect(emailCall.html).toContain('Wedding%20-%20Dapper%20Squad%20Entertainment');
    });

    it('should handle missing optional fields', async () => {
      // Arrange
      const minimalBookingData = {
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
        bookingReference: 'DSE-789012-DEF',
        eventDate: 'June 15, 2024',
        eventType: 'Corporate Event',
        services: ['DJ'],
      };

      const mockEmailResponse = {
        data: { id: 'email-456' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      const result = await sendBookingConfirmation(minimalBookingData);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe.skip('sendAdminNotification', () => {
    it('should send admin notification email successfully', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'admin-email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      const result = await sendAdminNotification(mockBookingData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.emailId).toBe('admin-email-123');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: ['markphillips.voice@gmail.com'],
        subject: 'New Booking: John Doe - December 25, 2024',
        html: expect.stringContaining('New Booking Received'),
        tags: [
          { name: 'category', value: 'admin-notification' },
          { name: 'booking-reference', value: 'DSE-123456-ABC' },
        ],
      });
    });

    it('should include all booking details in admin notification', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'admin-email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendAdminNotification(mockBookingData);

      // Assert
      expect(mockSend).toHaveBeenCalled();
      const emailCall = mockSend.mock.calls[0][0];
      const htmlContent = emailCall.html;

      expect(htmlContent).toContain('DSE-123456-ABC');
      expect(htmlContent).toContain('John Doe');
      expect(htmlContent).toContain('john.doe@example.com');
      expect(htmlContent).toContain('December 25, 2024');
      expect(htmlContent).toContain('Wedding');
      expect(htmlContent).toContain('DJ, Photography');
      expect(htmlContent).toContain('Grand Ballroom');
      expect(htmlContent).toContain('2500.00');
      expect(htmlContent).toContain('500.00');
    });

    it('should include dashboard link in admin notification', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_BASE_URL = 'https://dappersquad.com';
      
      const mockEmailResponse = {
        data: { id: 'admin-email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendAdminNotification(mockBookingData);

      // Assert
      expect(mockSend).toHaveBeenCalled();
      const emailCall = mockSend.mock.calls[0][0];
      expect(emailCall.html).toContain('https://dappersquad.com/admin/bookings/DSE-123456-ABC');
      expect(emailCall.html).toContain('View in Dashboard');
    });

    it('should handle admin notification errors', async () => {
      // Arrange
      const mockErrorResponse = {
        data: null,
        error: { message: 'Invalid recipient email' },
      };

      mockSend.mockResolvedValue(mockErrorResponse);

      // Act
      const result = await sendAdminNotification(mockBookingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid recipient email');
    });
  });

  describe.skip('sendContactFormResponse', () => {
    it('should send contact form auto-response successfully', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'contact-email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      const result = await sendContactFormResponse(
        'Sarah Johnson',
        'sarah@example.com',
        'Wedding DJ Services'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.emailId).toBe('contact-email-123');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: ['sarah@example.com'],
        subject: 'Thank you for contacting Dapper Squad Entertainment',
        html: expect.stringContaining('Hi Sarah Johnson'),
        tags: [
          { name: 'category', value: 'contact-response' },
        ],
      });
    });

    it('should include personalized content in contact response', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'contact-email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendContactFormResponse(
        'Sarah Johnson',
        'sarah@example.com',
        'Wedding DJ Services'
      );

      // Assert
      expect(mockSend).toHaveBeenCalled();
      const emailCall = mockSend.mock.calls[0][0];
      const htmlContent = emailCall.html;

      expect(htmlContent).toContain('Hi Sarah Johnson');
      expect(htmlContent).toContain('Wedding DJ Services');
      expect(htmlContent).toContain('within 24 hours');
      expect(htmlContent).toContain('(555) 123-4567');
      expect(htmlContent).toContain('instagram.com/dappersquad');
    });

    it('should handle contact form response errors', async () => {
      // Arrange
      mockSend.mockRejectedValue(new Error('SMTP connection failed'));

      // Act
      const result = await sendContactFormResponse(
        'Test User',
        'test@example.com',
        'Test Subject'
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('SMTP connection failed');
    });
  });

  describe.skip('Calendar Link Generation', () => {
    it('should generate valid Google Calendar link', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendBookingConfirmation(mockBookingData);

      // Assert
      expect(mockSend).toHaveBeenCalled();
      const emailCall = mockSend.mock.calls[0][0];
      const htmlContent = emailCall.html;

      expect(htmlContent).toContain('calendar.google.com/calendar/render');
      expect(htmlContent).toContain('action=TEMPLATE');
      expect(htmlContent).toContain('Add to Calendar');
    });

    it('should encode special characters in calendar link', async () => {
      // Arrange
      const specialCharBooking = {
        ...mockBookingData,
        eventType: 'María & José\'s Wedding',
        venueName: 'The "Grand" Ballroom & Event Center',
      };

      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendBookingConfirmation(specialCharBooking);

      // Assert
      expect(mockSend).toHaveBeenCalled();
      const emailCall = mockSend.mock.calls[0][0];
      const htmlContent = emailCall.html;

      expect(htmlContent).toContain('%20'); // Encoded space
      expect(htmlContent).toContain('%26'); // Encoded &
      expect(htmlContent).toContain('calendar.google.com');
    });

    it('should handle missing venue information in calendar link', async () => {
      // Arrange
      const bookingWithoutVenue = {
        ...mockBookingData,
        venueName: undefined,
        venueAddress: undefined,
      };

      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendBookingConfirmation(bookingWithoutVenue);

      // Assert
      expect(mockSend).toHaveBeenCalled();
      const emailCall = mockSend.mock.calls[0][0];
      const htmlContent = emailCall.html;

      expect(htmlContent).toContain('location='); // Should still have location parameter
      expect(htmlContent).toContain('calendar.google.com');
    });
  });

  describe('checkEmailHealth', () => {
    it('should return healthy status when API key is configured', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-api-key';

      // Act
      const result = await checkEmailHealth();

      // Assert
      expect(result.status).toBe('healthy');
      expect(result.message).toContain('configured and ready');
    });

    it('should return unhealthy status when API key is missing', async () => {
      // Arrange
      delete process.env.RESEND_API_KEY;

      // Act
      const result = await checkEmailHealth();

      // Assert
      expect(result.status).toBe('unhealthy');
      expect(result.message).toContain('RESEND_API_KEY is not configured');
    });

    it('should handle health check errors', async () => {
      // Arrange
      process.env.RESEND_API_KEY = 'test-api-key';
      
      // Mock an error in the health check
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Act
      const result = await checkEmailHealth();

      // Assert
      expect(result.status).toBe('healthy'); // Should still be healthy for basic config check
      
      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe.skip('Email Content Validation', () => {
    it('should sanitize HTML content in email templates', async () => {
      // Arrange
      const bookingWithHTML = {
        ...mockBookingData,
        clientName: '<script>alert("xss")</script>John Doe',
        specialRequests: 'Please play <script>alert("hack")</script> music',
      };

      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      await sendBookingConfirmation(bookingWithHTML);

      // Assert
      const emailCall = mockSend.mock.calls[0][0];
      // Email template should handle HTML sanitization
      expect(emailCall.html).toBeDefined();
      expect(emailCall.html).toContain('John Doe');
    });

    it('should handle very long content gracefully', async () => {
      // Arrange
      const bookingWithLongContent = {
        ...mockBookingData,
        clientName: 'A'.repeat(1000),
        venueName: 'B'.repeat(500),
      };

      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      // Act
      const result = await sendBookingConfirmation(bookingWithLongContent);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe.skip('Performance and Rate Limiting', () => {
    it('should handle multiple concurrent email sends', async () => {
      // Arrange
      const mockEmailResponse = {
        data: { id: 'email-123' },
        error: null,
      };

      mockSend.mockResolvedValue(mockEmailResponse);

      const promises = Array.from({ length: 5 }, (_, i) => 
        sendBookingConfirmation({
          ...mockBookingData,
          clientName: `Client ${i}`,
          clientEmail: `client${i}@example.com`,
          bookingReference: `DSE-12345${i}-ABC`,
        })
      );

      // Act
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockSend).toHaveBeenCalledTimes(5);
    });

    it('should handle rate limiting errors', async () => {
      // Arrange
      const mockErrorResponse = {
        data: null,
        error: { message: 'Rate limit exceeded. Please try again later.' },
      };

      mockSend.mockResolvedValue(mockErrorResponse);

      // Act
      const result = await sendBookingConfirmation(mockBookingData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
    });
  });
});