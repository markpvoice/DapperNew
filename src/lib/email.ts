import { Resend } from 'resend';
import { isValidEmail } from './utils';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@dappersquad.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dappersquad.com';

export interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  bookingReference: string;
  eventDate: string;
  eventType: string;
  services: string[];
  venueName?: string;
  venueAddress?: string;
  totalAmount?: number;
  depositAmount?: number;
  paymentLink?: string;
}

export async function sendBookingConfirmation(data: BookingEmailData) {
  try {
    // Validate email before sending
    if (!isValidEmail(data.clientEmail)) {
      throw new Error('Invalid client email address');
    }

    // Validate required fields
    if (!data.clientName || !data.bookingReference || !data.eventDate) {
      throw new Error('Missing required booking data');
    }

    const calendarLink = generateCalendarLink(data);

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.clientEmail],
      subject: `Booking Confirmed - ${data.bookingReference} | Dapper Squad Entertainment`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; border-bottom: 2px solid #FFD700;">
            <h1 style="color: #2C2C2C; margin: 0;">Dapper Squad Entertainment</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #2C2C2C;">Booking Confirmed!</h2>
            
            <p>Hi ${data.clientName},</p>
            
            <p>Your booking has been confirmed! Here are the details:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2C2C2C; margin-top: 0;">Booking Details</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Reference:</strong> ${data.bookingReference}</li>
                <li><strong>Event Date:</strong> ${data.eventDate}</li>
                <li><strong>Event Type:</strong> ${data.eventType}</li>
                <li><strong>Services:</strong> ${data.services.join(', ')}</li>
                ${data.venueName ? `<li><strong>Venue:</strong> ${data.venueName}</li>` : ''}
                ${data.venueAddress ? `<li><strong>Address:</strong> ${data.venueAddress}</li>` : ''}
              </ul>
            </div>
            
            <p><a href="${calendarLink}" style="background-color: #FFD700; color: #2C2C2C; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Add to Calendar</a></p>
            
            <p>We're excited to make your event legendary!</p>
            
            <p>Best regards,<br><strong>The Dapper Squad Team</strong></p>
          </div>
        </div>
      `,
      tags: [
        {
          name: 'category',
          value: 'booking-confirmation',
        },
        {
          name: 'booking-reference',
          value: data.bookingReference,
        },
      ],
    });

    if (error) {
      throw new Error(`Failed to send booking confirmation: ${error.message}`);
    }

    return {
      success: true,
      emailId: emailData?.id,
      message: 'Booking confirmation sent successfully',
    };
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function sendAdminNotification(data: BookingEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `New Booking: ${data.clientName} - ${data.eventDate}`,
      html: `
        <h2>New Booking Received</h2>
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Reference:</strong> ${data.bookingReference}</li>
            <li><strong>Client:</strong> ${data.clientName} (${data.clientEmail})</li>
            <li><strong>Event Date:</strong> ${data.eventDate}</li>
            <li><strong>Event Type:</strong> ${data.eventType}</li>
            <li><strong>Services:</strong> ${data.services.join(', ')}</li>
            ${data.venueName ? `<li><strong>Venue:</strong> ${data.venueName}</li>` : ''}
            ${data.venueAddress ? `<li><strong>Address:</strong> ${data.venueAddress}</li>` : ''}
            ${data.totalAmount ? `<li><strong>Total:</strong> $${data.totalAmount.toFixed(2)}</li>` : ''}
            ${data.depositAmount ? `<li><strong>Deposit:</strong> $${data.depositAmount.toFixed(2)}</li>` : ''}
          </ul>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/bookings/${data.bookingReference}" 
               style="background-color: #FFD700; color: #2C2C2C; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View in Dashboard
            </a>
          </p>
        </div>
      `,
      tags: [
        {
          name: 'category',
          value: 'admin-notification',
        },
        {
          name: 'booking-reference',
          value: data.bookingReference,
        },
      ],
    });

    if (error) {
      throw new Error(`Failed to send admin notification: ${error.message}`);
    }

    return {
      success: true,
      emailId: emailData?.id,
      message: 'Admin notification sent successfully',
    };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function sendContactFormResponse(name: string, email: string, subject: string) {
  try {
    // Validate email before sending
    if (!isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    // Validate required fields
    if (!name || !subject) {
      throw new Error('Missing required contact data');
    }
    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Thank you for contacting Dapper Squad Entertainment',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; border-bottom: 2px solid #FFD700;">
            <h1 style="color: #2C2C2C; margin: 0;">Dapper Squad Entertainment</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #2C2C2C;">Hi ${name},</h2>
            
            <p>Thank you for reaching out to us! We've received your message regarding "${subject}" and will get back to you within 24 hours.</p>
            
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Browse our services on our <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #FFD700;">website</a></li>
              <li>Check out our recent work on <a href="https://instagram.com/dappersquad" style="color: #FFD700;">Instagram</a></li>
              <li>Call us directly at <a href="tel:+15551234567" style="color: #FFD700;">(555) 123-4567</a> for immediate assistance</li>
            </ul>
            
            <p>We're excited to potentially work with you!</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>The Dapper Squad Team</strong><br>
              🎉 <em>Making every event legendary</em> 🎉
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #eaeaea;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              📞 (555) 123-4567 | ✉️ info@dappersquad.com | 🌐 www.dappersquad.com
            </p>
          </div>
        </div>
      `,
      tags: [
        {
          name: 'category',
          value: 'contact-response',
        },
      ],
    });

    if (error) {
      throw new Error(`Failed to send contact response: ${error.message}`);
    }

    return {
      success: true,
      emailId: emailData?.id,
      message: 'Contact form response sent successfully',
    };
  } catch (error) {
    console.error('Error sending contact form response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Helper function to generate calendar link
function generateCalendarLink(data: BookingEmailData): string {
  const eventDate = new Date(data.eventDate);
  const eventEndDate = new Date(eventDate.getTime() + 6 * 60 * 60 * 1000); // 6 hours later

  const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = eventEndDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const title = encodeURIComponent(`${data.eventType} - Dapper Squad Entertainment`);
  const details = encodeURIComponent(
    `Services: ${data.services.join(', ')}\n\nBooking Reference: ${data.bookingReference}\n\nContact: (555) 123-4567`
  );
  const location = data.venueName
    ? encodeURIComponent(`${data.venueName}, ${data.venueAddress || ''}`)
    : '';

  // Google Calendar link
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
}

// Email health check
export async function checkEmailHealth() {
  try {
    // This is a simple way to check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        status: 'unhealthy',
        message: 'RESEND_API_KEY is not configured',
      };
    }

    return {
      status: 'healthy',
      message: 'Email service is configured and ready',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Email service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
