import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}`
  : 'http://localhost:3000';

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img
            src={`${baseUrl}/images/logo-email.png`}
            width="200"
            height="60"
            alt="Dapper Squad Entertainment"
            style={logo}
          />
        </Section>

        {/* Main Content */}
        <Section style={content}>
          {children}
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            <strong>Dapper Squad Entertainment</strong>
            <br />
            Professional DJ, Karaoke & Photography Services
            <br />
            Chicago-Milwaukee Area
          </Text>
          
          <Text style={footerText}>
            📞 <Link href="tel:+15551234567" style={link}>(555) 123-4567</Link>
            <br />
            ✉️ <Link href="mailto:info@dappersquad.com" style={link}>info@dappersquad.com</Link>
            <br />
            🌐 <Link href={baseUrl} style={link}>www.dappersquad.com</Link>
          </Text>

          <Text style={footerText}>
            Follow us on social media:
            <br />
            <Link href="https://facebook.com/dappersquad" style={socialLink}>Facebook</Link>
            {' • '}
            <Link href="https://instagram.com/dappersquad" style={socialLink}>Instagram</Link>
            {' • '}
            <Link href="https://twitter.com/dappersquad" style={socialLink}>Twitter</Link>
          </Text>

          <Text style={disclaimerText}>
            This email was sent to you because you contacted Dapper Squad Entertainment 
            or have an active booking with us. If you believe you received this email in error, 
            please contact us at{' '}
            <Link href="mailto:info@dappersquad.com" style={link}>
              info@dappersquad.com
            </Link>
            .
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 0',
  textAlign: 'center' as const,
  borderBottom: '2px solid #FFD700',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '40px 20px',
};

const footer = {
  borderTop: '1px solid #eaeaea',
  padding: '20px',
  textAlign: 'center' as const,
  backgroundColor: '#f8f9fa',
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const disclaimerText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '20px 0 0',
};

const link = {
  color: '#FFD700',
  textDecoration: 'underline',
};

const socialLink = {
  color: '#FFD700',
  textDecoration: 'none',
  fontWeight: 'bold',
};