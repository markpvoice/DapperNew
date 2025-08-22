import {
  Button,
  Column,
  Heading,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/email-layout';

interface BookingConfirmationProps {
  clientName: string;
  bookingReference: string;
  eventDate: string;
  eventType: string;
  services: string[];
  venueName?: string;
  venueAddress?: string;
  totalAmount?: number;
  depositAmount?: number;
  paymentLink?: string;
  calendarLink?: string;
}

export const BookingConfirmationEmail = ({
  clientName,
  bookingReference,
  eventDate,
  eventType,
  services,
  venueName,
  venueAddress,
  totalAmount,
  depositAmount,
  paymentLink,
  calendarLink,
}: BookingConfirmationProps) => {
  const previewText = `Booking confirmed for ${eventDate} - ${bookingReference}`;

  return (
    <EmailLayout preview={previewText}>
      {/* Main Heading */}
      <Heading style={h1}>
        🎉 Booking Confirmed!
      </Heading>

      <Text style={text}>
        Hi {clientName},
      </Text>

      <Text style={text}>
        Thank you for choosing Dapper Squad Entertainment! We're excited to be part of your special day. 
        Your booking has been confirmed and we've got all the details below.
      </Text>

      {/* Booking Details */}
      <Section style={bookingDetailsSection}>
        <Heading style={h2}>📋 Booking Details</Heading>
        
        <Section style={detailsGrid}>
          <Row>
            <Column style={labelColumn}>
              <Text style={labelText}>Booking Reference:</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={valueText}><strong>{bookingReference}</strong></Text>
            </Column>
          </Row>

          <Row>
            <Column style={labelColumn}>
              <Text style={labelText}>Event Date:</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={valueText}><strong>{eventDate}</strong></Text>
            </Column>
          </Row>

          <Row>
            <Column style={labelColumn}>
              <Text style={labelText}>Event Type:</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={valueText}>{eventType}</Text>
            </Column>
          </Row>

          <Row>
            <Column style={labelColumn}>
              <Text style={labelText}>Services:</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={valueText}>{services.join(', ')}</Text>
            </Column>
          </Row>

          {venueName && (
            <Row>
              <Column style={labelColumn}>
                <Text style={labelText}>Venue:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={valueText}>{venueName}</Text>
                {venueAddress && (
                  <Text style={addressText}>{venueAddress}</Text>
                )}
              </Column>
            </Row>
          )}

          {totalAmount && (
            <Row>
              <Column style={labelColumn}>
                <Text style={labelText}>Total Amount:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={priceText}><strong>${totalAmount.toFixed(2)}</strong></Text>
              </Column>
            </Row>
          )}

          {depositAmount && (
            <Row>
              <Column style={labelColumn}>
                <Text style={labelText}>Deposit Required:</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={priceText}><strong>${depositAmount.toFixed(2)}</strong></Text>
              </Column>
            </Row>
          )}
        </Section>
      </Section>

      <Hr style={divider} />

      {/* Next Steps */}
      <Section style={nextStepsSection}>
        <Heading style={h2}>🚀 Next Steps</Heading>
        
        <Text style={text}>
          <strong>1. Secure Your Date</strong>
          <br />
          {depositAmount ? (
            `Please pay your deposit of $${depositAmount.toFixed(2)} to secure your booking date.`
          ) : (
            'Your booking date has been secured.'
          )}
        </Text>

        {paymentLink && (
          <Section style={buttonSection}>
            <Button style={paymentButton} href={paymentLink}>
              💳 Pay Deposit Now
            </Button>
          </Section>
        )}

        <Text style={text}>
          <strong>2. Add to Your Calendar</strong>
          <br />
          Don't forget to add this important date to your calendar.
        </Text>

        {calendarLink && (
          <Section style={buttonSection}>
            <Button style={calendarButton} href={calendarLink}>
              📅 Add to Calendar
            </Button>
          </Section>
        )}

        <Text style={text}>
          <strong>3. Final Details</strong>
          <br />
          We'll reach out 1 week before your event to confirm final details and answer any questions.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Service-Specific Information */}
      <Section style={serviceInfoSection}>
        <Heading style={h2}>🎵 What to Expect</Heading>
        
        {services.includes('DJ') && (
          <Text style={text}>
            <strong>🎧 DJ Services:</strong>
            <br />
            • Professional sound system and lighting
            <br />
            • Our DJ will arrive 2 hours before your event for setup
            <br />
            • Music requests can be submitted up to 1 week before your event
            <br />
            • We have an extensive library of music across all genres and decades
          </Text>
        )}

        {services.includes('Photography') && (
          <Text style={text}>
            <strong>📸 Photography Services:</strong>
            <br />
            • Professional event photographer
            <br />
            • High-resolution photos delivered within 48 hours
            <br />
            • Online gallery for easy sharing with friends and family
            <br />
            • All photos include basic editing and enhancement
          </Text>
        )}

        {services.includes('Karaoke') && (
          <Text style={text}>
            <strong>🎤 Karaoke Services:</strong>
            <br />
            • Professional karaoke system with wireless microphones
            <br />
            • Library of 10,000+ songs across all genres
            <br />
            • Song request system for your guests
            <br />
            • Dedicated karaoke host to keep the fun going
          </Text>
        )}
      </Section>

      <Hr style={divider} />

      {/* Contact Information */}
      <Section style={contactSection}>
        <Heading style={h2}>💬 Questions or Changes?</Heading>
        
        <Text style={text}>
          We're here to help! If you have any questions or need to make changes to your booking, 
          don't hesitate to reach out to us:
        </Text>

        <Text style={text}>
          📞 <Link href="tel:+15551234567" style={link}>(555) 123-4567</Link>
          <br />
          ✉️ <Link href="mailto:bookings@dappersquad.com" style={link}>bookings@dappersquad.com</Link>
          <br />
          💬 Text us anytime for quick questions
        </Text>

        <Text style={text}>
          You can also reply directly to this email and we'll get back to you within 24 hours.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Thank You */}
      <Section style={thanksSection}>
        <Text style={text}>
          Thank you again for choosing Dapper Squad Entertainment. We can't wait to help make your 
          {eventType.toLowerCase()} absolutely unforgettable!
        </Text>

        <Text style={signature}>
          Best regards,
          <br />
          <strong>The Dapper Squad Team</strong>
          <br />
          🎉 <em>Making every event legendary</em> 🎉
        </Text>
      </Section>
    </EmailLayout>
  );
};

// Styles
const h1 = {
  color: '#2C2C2C',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const h2 = {
  color: '#2C2C2C',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '30px 0 20px',
};

const text = {
  color: '#2C2C2C',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const bookingDetailsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '20px 0',
};

const detailsGrid = {
  margin: '0',
};

const labelColumn = {
  width: '40%',
  paddingRight: '10px',
};

const valueColumn = {
  width: '60%',
};

const labelText = {
  color: '#6C757D',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const valueText = {
  color: '#2C2C2C',
  fontSize: '16px',
  margin: '8px 0',
};

const addressText = {
  color: '#6C757D',
  fontSize: '14px',
  margin: '4px 0 8px',
};

const priceText = {
  color: '#FFD700',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const nextStepsSection = {
  margin: '30px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const paymentButton = {
  backgroundColor: '#FFD700',
  borderRadius: '6px',
  color: '#2C2C2C',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '10px auto',
  maxWidth: '200px',
};

const calendarButton = {
  backgroundColor: '#6C757D',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '10px auto',
  maxWidth: '200px',
};

const serviceInfoSection = {
  margin: '30px 0',
};

const contactSection = {
  margin: '30px 0',
};

const thanksSection = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const signature = {
  color: '#2C2C2C',
  fontSize: '16px',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '30px 0 0',
};

const divider = {
  borderColor: '#e1e5e9',
  margin: '30px 0',
};

const link = {
  color: '#FFD700',
  textDecoration: 'underline',
};