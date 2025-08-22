# Dapper Squad Entertainment - Modern Web Application

A modern, production-ready web application for Dapper Squad Entertainment - providing DJ, Karaoke, and Photography services in the Chicago-Milwaukee area.

## 🎯 Project Overview

This application transforms a single-page HTML demo into a scalable, professional web platform featuring:

- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, PostgreSQL
- **Automated Email System**: Professional booking confirmations and reminders
- **Admin Dashboard**: Comprehensive booking and client management
- **Payment Integration**: Secure deposit and payment processing
- **Performance Optimized**: < 1.5s load times, excellent SEO
- **Mobile-First Design**: Responsive across all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Resend account (for emails)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dapper-squad-entertainment.git
   cd dapper-squad-entertainment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
dapper-squad-entertainment/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (routes)/          # Page routes
│   │   ├── api/               # API endpoints
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── forms/             # Form components
│   │   ├── sections/          # Page sections
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities and configurations
│   │   ├── db.ts              # Database connection
│   │   ├── email.ts           # Email service
│   │   ├── auth.ts            # Authentication
│   │   └── utils.ts           # Helper functions
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript definitions
├── emails/                    # React Email templates
├── prisma/                    # Database schema and migrations
├── tests/                     # Test files
└── public/                    # Static assets
```

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

### Testing
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests
npm run test:coverage # Run tests with coverage
```

### Email Development
```bash
npm run email        # Start email preview server
```

## 🎨 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Production-grade database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Email & Communication
- **Resend** - Modern email API
- **React Email** - Styled email templates
- **Calendar Integration** - ICS file generation

### Payment Processing
- **Stripe** - Secure payment processing
- **Webhook handling** - Real-time payment updates

### Development Tools
- **ESLint & Prettier** - Code formatting and linting
- **Husky** - Git hooks for code quality
- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing

## 🔒 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dappersquad"

# Email Service
RESEND_API_KEY="re_your_api_key"

# Payment Processing
STRIPE_PUBLIC_KEY="pk_test_your_key"
STRIPE_SECRET_KEY="sk_test_your_key"

# Authentication
JWT_SECRET="your_jwt_secret"
NEXTAUTH_SECRET="your_nextauth_secret"

# Admin Access
ADMIN_EMAIL="admin@dappersquad.com"
ADMIN_PASSWORD_HASH="$2b$10$your_hashed_password"
```

## 📊 Key Features

### 🎵 Booking System
- Real-time availability checking
- Multi-service selection (DJ, Karaoke, Photography)
- Automatic booking reference generation
- Calendar integration for clients

### 📧 Email Automation
- Instant booking confirmations
- Automated reminder system (1 week, 24 hours)
- Thank you and review requests
- Admin notifications
- Professional branded templates

### 💳 Payment Processing
- Secure deposit collection via Stripe
- Automated payment confirmations
- Invoice generation
- Refund processing capabilities

### 👨‍💼 Admin Dashboard
- Booking management interface
- Client communication tools
- Revenue analytics
- Calendar availability management
- Export functionality (CSV, PDF)

### 📱 User Experience
- Mobile-first responsive design
- Progressive Web App capabilities
- Accessibility compliant (WCAG 2.1 AA)
- Core Web Vitals optimized
- SEO optimized with structured data

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy to your hosting provider
3. Set up PostgreSQL database
4. Configure environment variables
5. Run database migrations: `npm run db:migrate`

## 📈 Performance Targets

- **Page Load Time**: < 1.5 seconds
- **Core Web Vitals**: All green scores (90+)
- **Mobile Performance**: 95+ Lighthouse score
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO Score**: 95+ Lighthouse score

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Booking form submission
- [ ] Email confirmations sent
- [ ] Payment processing
- [ ] Admin dashboard access
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 📝 API Documentation

### Booking Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

### Calendar Endpoints
- `GET /api/calendar` - Get availability
- `PUT /api/calendar/availability` - Update availability

### Contact Endpoints
- `POST /api/contact` - Submit contact form

### Admin Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/analytics` - Business analytics

## 🔧 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database connection
npm run db:studio
```

**Email Not Sending**
- Verify RESEND_API_KEY is set correctly
- Check spam folder
- Review email logs in Resend dashboard

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Development Reset
```bash
# Fresh start
rm -rf node_modules .next
npm install
npm run db:generate
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed

## 📞 Support

For support and questions:

- **Email**: dev@dappersquad.com
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues tab

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Email templates with [React Email](https://react.email/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://prisma.io/)
- Payments by [Stripe](https://stripe.com/)

---

**Made with ❤️ for Dapper Squad Entertainment**  
*Making every event legendary* 🎉