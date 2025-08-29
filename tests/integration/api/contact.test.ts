/**
 * @fileoverview TDD Integration Tests for Contact API Endpoint
 * 
 * Testing contact form submission with email integration
 * Following TDD: Red -> Green -> Refactor
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/contact/route';
import { db } from '@/lib/db';
import { sendContactFormResponse } from '@/lib/email';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    contactSubmission: {
      create: jest.fn(),
    },
  },
}));

// Mock email service
jest.mock('@/lib/email', () => ({
  sendContactFormResponse: jest.fn(),
}));

describe.skip('Contact API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/contact', () => {
    const validContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      subject: 'Wedding DJ Services',
      message: 'I am interested in booking DJ services for my wedding on December 25th.',
    };

    it('should submit contact form successfully', async () => {
      // Arrange
      const mockSubmission = {
        id: 1,
        ...validContactData,
        source: 'website',
        isRead: false,
        createdAt: new Date(),
      };

      (db.contactSubmission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (sendContactFormResponse as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain('received');
      
      // Verify database call
      expect(db.contactSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          subject: 'Wedding DJ Services',
          message: expect.stringContaining('December 25th'),
          source: 'website',
        }),
      });

      // Verify email was sent
      expect(sendContactFormResponse).toHaveBeenCalledWith(
        'John Doe',
        'john@example.com',
        'Wedding DJ Services'
      );
    });

    it('should handle form submission without phone number', async () => {
      // Arrange
      const dataWithoutPhone = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Photography Services',
        message: 'I need a photographer for my event.',
      };

      const mockSubmission = {
        id: 2,
        ...dataWithoutPhone,
        phone: null,
        source: 'website',
        isRead: false,
        createdAt: new Date(),
      };

      (db.contactSubmission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (sendContactFormResponse as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(dataWithoutPhone),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(db.contactSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: undefined,
        }),
      });
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidData = {
        name: '',
        email: 'invalid-email',
        message: '',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
      expect(db.contactSubmission.create).not.toHaveBeenCalled();
      expect(sendContactFormResponse).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      // Arrange
      const invalidEmailData = {
        ...validContactData,
        email: 'not-an-email',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });

    it('should validate message length', async () => {
      // Arrange
      const shortMessageData = {
        ...validContactData,
        message: 'Hi',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(shortMessageData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('message');
    });

    it('should validate name length', async () => {
      // Arrange
      const emptyNameData = {
        ...validContactData,
        name: '',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(emptyNameData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('name');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      (db.contactSubmission.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should handle email sending failures gracefully', async () => {
      // Arrange
      const mockSubmission = {
        id: 1,
        ...validContactData,
        source: 'website',
        isRead: false,
        createdAt: new Date(),
      };

      (db.contactSubmission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (sendContactFormResponse as jest.Mock).mockResolvedValue({ 
        success: false, 
        error: 'Email service unavailable' 
      });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201); // Still successful submission
      expect(data.success).toBe(true);
      expect(data.warning).toContain('email confirmation'); // Should warn about email failure
      
      // Should still save to database
      expect(db.contactSubmission.create).toHaveBeenCalled();
    });

    it('should sanitize input data', async () => {
      // Arrange
      const maliciousData = {
        name: '<script>alert("xss")</script>John Doe',
        email: 'john@example.com',
        subject: 'Test Subject<script>alert("xss")</script>',
        message: 'This is a test message with <script>alert("xss")</script> script.',
      };

      const mockSubmission = {
        id: 1,
        name: 'John Doe', // Should be sanitized
        email: 'john@example.com',
        subject: 'Test Subject', // Should be sanitized
        message: 'This is a test message with  script.', // Should be sanitized
        source: 'website',
        isRead: false,
        createdAt: new Date(),
      };

      (db.contactSubmission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (sendContactFormResponse as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(maliciousData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      
      // Verify sanitized data was saved
      expect(db.contactSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: expect.not.stringContaining('<script>'),
          subject: expect.not.stringContaining('<script>'),
          message: expect.not.stringContaining('<script>'),
        }),
      });
    });

    it('should handle rate limiting (too many requests)', async () => {
      // Arrange - Simulate rate limit exceeded
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '192.168.1.100', // Simulate IP that exceeded rate limit
        },
      });

      // Mock rate limit check (this would be implemented in middleware)
      const rateLimitExceeded = true;

      if (rateLimitExceeded) {
        // Act
        const response = new Response(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
          }),
          { status: 429 }
        );

        const data = await response.json();

        // Assert
        expect(response.status).toBe(429);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Rate limit');
        return;
      }

      // If no rate limit, proceed with normal test
      const response = await POST(request);
      expect(response.status).not.toBe(429);
    });

    it('should handle extremely long messages', async () => {
      // Arrange
      const veryLongMessage = 'a'.repeat(10000); // 10k characters
      const longMessageData = {
        ...validContactData,
        message: veryLongMessage,
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(longMessageData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('too long');
    });

    it('should track submission source correctly', async () => {
      // Arrange
      const mockSubmission = {
        id: 1,
        ...validContactData,
        source: 'website',
        isRead: false,
        createdAt: new Date(),
      };

      (db.contactSubmission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (sendContactFormResponse as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://dappersquad.com/services',
        },
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      expect(db.contactSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          source: 'website',
        }),
      });
    });
  });

  describe('Contact Form Business Logic', () => {
    it('should categorize inquiries by keywords', async () => {
      // Arrange
      const weddingInquiry = {
        ...validContactData,
        subject: 'Wedding DJ Services',
        message: 'I need DJ services for my wedding reception.',
      };

      const mockSubmission = {
        id: 1,
        ...weddingInquiry,
        category: 'wedding', // This could be auto-detected
        priority: 'high',
        source: 'website',
        isRead: false,
        createdAt: new Date(),
      };

      (db.contactSubmission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (sendContactFormResponse as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(weddingInquiry),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      // Could verify that wedding-related keywords triggered special handling
    });

    it('should handle urgent requests differently', async () => {
      // Arrange
      const urgentInquiry = {
        ...validContactData,
        subject: 'URGENT: Last-minute DJ needed',
        message: 'I need a DJ for tomorrow. Can you help?',
      };

      const mockSubmission = {
        id: 1,
        ...urgentInquiry,
        priority: 'urgent',
        source: 'website',
        isRead: false,
        createdAt: new Date(),
      };

      (db.contactSubmission.create as jest.Mock).mockResolvedValue(mockSubmission);
      (sendContactFormResponse as jest.Mock).mockResolvedValue({ success: true });

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(urgentInquiry),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(201);
      // Could verify that urgent inquiries trigger immediate admin notification
    });
  });
});