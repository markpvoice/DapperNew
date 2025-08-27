import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean up existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️ Cleaning up existing data...');
    await prisma.emailNotification.deleteMany();
    await prisma.calendarAvailability.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.contactSubmission.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.pageView.deleteMany();
    await prisma.adminUser.deleteMany();
    await prisma.service.deleteMany();
  }

  // 1. Seed Services
  console.log('🎵 Seeding services...');
  const services = await prisma.service.createMany({
    data: [
      {
        name: 'DJ Services',
        description: 'Professional DJ services with premium sound equipment and extensive music library covering all genres. Perfect for weddings, corporate events, and parties.',
        priceRange: '$500-$1500',
        imageUrl: '/images/services/dj-setup.jpg',
        isActive: true,
      },
      {
        name: 'Karaoke Entertainment',
        description: 'Interactive karaoke entertainment with 10,000+ songs, professional microphones, and engaging host services to keep your guests entertained.',
        priceRange: '$300-$800',
        imageUrl: '/images/services/karaoke-night.jpg',
        isActive: true,
      },
      {
        name: 'Event Photography',
        description: 'Professional event photography capturing all the memorable moments of your special day. High-quality images delivered within 48 hours.',
        priceRange: '$400-$1200',
        imageUrl: '/images/services/photography-session.jpg',
        isActive: true,
      },
    ],
  });

  // 2. Seed Admin User
  console.log('👨‍💼 Seeding admin user...');
  const hashedPassword = await bcrypt.hash('admin123!', 12);
  await prisma.adminUser.create({
    data: {
      email: 'admin@dappersquad.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    },
  });

  // 3. Seed Testimonials
  console.log('⭐ Seeding testimonials...');
  await prisma.testimonial.createMany({
    data: [
      {
        clientName: 'Sarah & Mike Johnson',
        content: 'Dapper Squad Entertainment made our wedding absolutely perfect! The DJ kept everyone dancing all night long, and the photo quality was outstanding. Highly recommend!',
        rating: 5,
        eventType: 'Wedding',
        eventDate: new Date('2024-06-15'),
        isApproved: true,
        isFeatured: true,
      },
      {
        clientName: 'TechCorp Inc.',
        content: 'Professional service for our annual company party. Great music selection and the team was very responsive to our needs. Will definitely book again!',
        rating: 5,
        eventType: 'Corporate Event',
        eventDate: new Date('2024-08-22'),
        isApproved: true,
        isFeatured: true,
      },
      {
        clientName: 'Jennifer Martinez',
        content: 'The karaoke night was a huge hit at my birthday party! Everyone had such a great time singing their favorite songs. Great equipment and song selection.',
        rating: 5,
        eventType: 'Birthday Party',
        eventDate: new Date('2024-07-10'),
        isApproved: true,
        isFeatured: false,
      },
      {
        clientName: 'Robert & Lisa Chen',
        content: 'Amazing photography work! They captured every special moment of our anniversary celebration. The photos were ready within 24 hours as promised.',
        rating: 5,
        eventType: 'Anniversary',
        eventDate: new Date('2024-05-30'),
        isApproved: true,
        isFeatured: true,
      },
    ],
  });

  // 4. Seed Sample Bookings
  console.log('📅 Seeding sample bookings...');
  const sampleBookings = [
    {
      bookingReference: 'DSE-2024-001',
      clientName: 'Emily Rodriguez',
      clientEmail: 'emily@example.com',
      clientPhone: '555-0123',
      eventDate: new Date('2024-12-15'),
      eventStartTime: new Date('2024-12-15T18:00:00'),
      eventEndTime: new Date('2024-12-15T23:00:00'),
      eventType: 'Wedding Reception',
      servicesNeeded: ['DJ Services', 'Event Photography'],
      venueName: 'Grand Ballroom',
      venueAddress: '123 Main St, Chicago, IL 60601',
      guestCount: 150,
      specialRequests: 'Please play a mix of 80s and current hits. First dance song: "Perfect" by Ed Sheeran',
      status: 'CONFIRMED',
      depositAmount: 400,
      totalAmount: 1800,
      paymentStatus: 'DEPOSIT_PAID',
    },
    {
      bookingReference: 'DSE-2024-002',
      clientName: 'David Thompson',
      clientEmail: 'david@example.com',
      clientPhone: '555-0456',
      eventDate: new Date('2025-01-20'),
      eventStartTime: new Date('2025-01-20T19:00:00'),
      eventEndTime: new Date('2025-01-20T22:00:00'),
      eventType: 'Corporate Party',
      servicesNeeded: ['DJ Services', 'Karaoke Entertainment'],
      venueName: 'Corporate Center',
      venueAddress: '456 Business Ave, Milwaukee, WI 53202',
      guestCount: 75,
      specialRequests: 'Family-friendly music for company celebration',
      status: 'PENDING',
      depositAmount: 200,
      totalAmount: 900,
      paymentStatus: 'UNPAID',
    },
  ];

  for (const booking of sampleBookings) {
    await prisma.booking.create({
      data: booking,
    });
  }

  // 5. Seed Calendar Availability
  console.log('📅 Seeding calendar availability...');
  const startDate = new Date('2024-11-01');
  const endDate = new Date('2025-03-31');
  const availabilityData = [];

  // Create availability entries for next 5 months
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    
    // Mark some weekend dates as unavailable (booked)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBookedDate = Math.random() < (isWeekend ? 0.3 : 0.1); // 30% weekend, 10% weekday booking rate
    
    availabilityData.push({
      date: new Date(date),
      isAvailable: !isBookedDate,
      blockedReason: isBookedDate ? 'Booked Event' : null,
    });
  }

  await prisma.calendarAvailability.createMany({
    data: availabilityData,
  });

  // 6. Seed Contact Submissions
  console.log('📧 Seeding contact submissions...');
  await prisma.contactSubmission.createMany({
    data: [
      {
        name: 'Maria Gonzalez',
        email: 'maria@example.com',
        phone: '555-0789',
        subject: 'Wedding DJ Services Inquiry',
        message: 'Hi, I am interested in DJ services for my wedding on June 8th, 2025. Could you please send me more information about your packages?',
        source: 'website',
        isRead: false,
      },
      {
        name: 'James Wilson',
        email: 'james@example.com',
        phone: '555-0321',
        subject: 'Corporate Event Quote',
        message: 'We are planning a corporate event for 100 people and need both DJ and photography services. Please provide a quote.',
        source: 'website',
        isRead: true,
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  
  // Print summary
  const counts = await Promise.all([
    prisma.service.count(),
    prisma.adminUser.count(),
    prisma.testimonial.count(),
    prisma.booking.count(),
    prisma.calendarAvailability.count(),
    prisma.contactSubmission.count(),
  ]);

  console.log('\n📊 Seeding Summary:');
  console.log(`- Services: ${counts[0]}`);
  console.log(`- Admin Users: ${counts[1]}`);
  console.log(`- Testimonials: ${counts[2]}`);
  console.log(`- Bookings: ${counts[3]}`);
  console.log(`- Calendar Entries: ${counts[4]}`);
  console.log(`- Contact Submissions: ${counts[5]}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });