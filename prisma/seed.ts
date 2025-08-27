import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

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
    // September 2025 Demo Events
    {
      bookingReference: 'DSE-2025-003',
      clientName: 'Sarah & Jake Mitchell',
      clientEmail: 'sarah.mitchell@example.com',
      clientPhone: '555-0789',
      eventDate: new Date('2025-09-06'),
      eventStartTime: new Date('2025-09-06T17:00:00'),
      eventEndTime: new Date('2025-09-06T23:00:00'),
      eventType: 'Wedding',
      servicesNeeded: ['DJ Services', 'Event Photography'],
      venueName: 'Riverside Gardens',
      venueAddress: '789 Lake Shore Dr, Chicago, IL 60611',
      guestCount: 120,
      specialRequests: 'Outdoor ceremony, need weather backup plan. Mix of country and pop music.',
      status: 'CONFIRMED',
      depositAmount: 350,
      totalAmount: 1650,
      paymentStatus: 'DEPOSIT_PAID',
    },
    {
      bookingReference: 'DSE-2025-004',
      clientName: 'Madison TechCorp',
      clientEmail: 'events@madisontech.com',
      clientPhone: '555-0234',
      eventDate: new Date('2025-09-14'),
      eventStartTime: new Date('2025-09-14T18:30:00'),
      eventEndTime: new Date('2025-09-14T22:00:00'),
      eventType: 'Corporate Event',
      servicesNeeded: ['DJ Services', 'Karaoke Entertainment'],
      venueName: 'Downtown Convention Center',
      venueAddress: '1001 Convention Blvd, Milwaukee, WI 53233',
      guestCount: 200,
      specialRequests: 'Team building event with karaoke competitions. Clean music only.',
      status: 'CONFIRMED',
      depositAmount: 300,
      totalAmount: 1200,
      paymentStatus: 'PAID',
    },
    {
      bookingReference: 'DSE-2025-005',
      clientName: 'Lisa Chen',
      clientEmail: 'lisa.chen@example.com',
      clientPhone: '555-0567',
      eventDate: new Date('2025-09-21'),
      eventStartTime: new Date('2025-09-21T19:00:00'),
      eventEndTime: new Date('2025-09-21T23:30:00'),
      eventType: 'Birthday Party',
      servicesNeeded: ['DJ Services', 'Event Photography'],
      venueName: 'Private Residence',
      venueAddress: '456 Oak Street, Evanston, IL 60201',
      guestCount: 50,
      specialRequests: '30th birthday party! Love 2000s hits and R&B. Photo booth setup requested.',
      status: 'PENDING',
      depositAmount: 200,
      totalAmount: 800,
      paymentStatus: 'UNPAID',
    },
    {
      bookingReference: 'DSE-2025-006',
      clientName: 'Robert & Maria Santos',
      clientEmail: 'santos.family@example.com',
      clientPhone: '555-0890',
      eventDate: new Date('2025-09-28'),
      eventStartTime: new Date('2025-09-28T16:00:00'),
      eventEndTime: new Date('2025-09-28T21:00:00'),
      eventType: 'Anniversary',
      servicesNeeded: ['DJ Services', 'Event Photography'],
      venueName: 'Garden Pavilion',
      venueAddress: '234 Garden Lane, Schaumburg, IL 60173',
      guestCount: 80,
      specialRequests: '25th anniversary celebration. Latin music and classic ballroom favorites.',
      status: 'CONFIRMED',
      depositAmount: 250,
      totalAmount: 1100,
      paymentStatus: 'DEPOSIT_PAID',
    },
    // October 2025 Demo Events
    {
      bookingReference: 'DSE-2025-007',
      clientName: 'Amanda & Chris Johnson',
      clientEmail: 'amanda.johnson@example.com',
      clientPhone: '555-0345',
      eventDate: new Date('2025-10-04'),
      eventStartTime: new Date('2025-10-04T17:30:00'),
      eventEndTime: new Date('2025-10-04T23:30:00'),
      eventType: 'Wedding',
      servicesNeeded: ['DJ Services', 'Event Photography', 'Karaoke Entertainment'],
      venueName: 'Historic Manor House',
      venueAddress: '567 Heritage Drive, Lake Forest, IL 60045',
      guestCount: 180,
      specialRequests: 'Fall themed wedding. Mix of indie, folk, and classic rock. Late night karaoke session.',
      status: 'CONFIRMED',
      depositAmount: 500,
      totalAmount: 2200,
      paymentStatus: 'DEPOSIT_PAID',
    },
    {
      bookingReference: 'DSE-2025-008',
      clientName: 'Northwest High School',
      clientEmail: 'events@nwhs.edu',
      clientPhone: '555-0678',
      eventDate: new Date('2025-10-12'),
      eventStartTime: new Date('2025-10-12T19:00:00'),
      eventEndTime: new Date('2025-10-12T22:00:00'),
      eventType: 'School Dance',
      servicesNeeded: ['DJ Services'],
      venueName: 'School Gymnasium',
      venueAddress: '890 School Road, Arlington Heights, IL 60004',
      guestCount: 300,
      specialRequests: 'Homecoming dance. Current pop hits and clean versions only. LED light show.',
      status: 'CONFIRMED',
      depositAmount: 200,
      totalAmount: 600,
      paymentStatus: 'PAID',
    },
    {
      bookingReference: 'DSE-2025-009',
      clientName: 'Halloween Bash Committee',
      clientEmail: 'halloween@community.org',
      clientPhone: '555-0123',
      eventDate: new Date('2025-10-25'),
      eventStartTime: new Date('2025-10-25T20:00:00'),
      eventEndTime: new Date('2025-10-25T02:00:00'),
      eventType: 'Community Event',
      servicesNeeded: ['DJ Services', 'Karaoke Entertainment'],
      venueName: 'Community Center',
      venueAddress: '123 Main Street, Des Plaines, IL 60016',
      guestCount: 150,
      specialRequests: 'Halloween party! Spooky music, costume contest, themed karaoke songs.',
      status: 'PENDING',
      depositAmount: 150,
      totalAmount: 750,
      paymentStatus: 'UNPAID',
    },
    {
      bookingReference: 'DSE-2025-010',
      clientName: 'Elite Financial Group',
      clientEmail: 'hr@elitefinancial.com',
      clientPhone: '555-0456',
      eventDate: new Date('2025-10-31'),
      eventStartTime: new Date('2025-10-31T18:00:00'),
      eventEndTime: new Date('2025-10-31T23:00:00'),
      eventType: 'Corporate Event',
      servicesNeeded: ['DJ Services', 'Event Photography'],
      venueName: 'Skyline Ballroom',
      venueAddress: '456 Tower Drive, Chicago, IL 60606',
      guestCount: 100,
      specialRequests: 'Halloween corporate party. Professional but fun atmosphere. Photo booth with props.',
      status: 'CONFIRMED',
      depositAmount: 300,
      totalAmount: 1300,
      paymentStatus: 'DEPOSIT_PAID',
    },
  ];

  const createdBookings = [];
  for (const booking of sampleBookings) {
    const createdBooking = await prisma.booking.create({
      data: booking,
    });
    createdBookings.push(createdBooking);
  }

  // 5. Seed Calendar Availability
  console.log('📅 Seeding calendar availability...');
  const startDate = new Date('2024-11-01');
  const endDate = new Date('2025-12-31');
  const availabilityData = [];

  // Create a map of booking dates to booking IDs
  const bookingsByDate = new Map();
  createdBookings.forEach((booking) => {
    const dateStr = booking.eventDate.toISOString().split('T')[0];
    bookingsByDate.set(dateStr, booking.id);
  });

  // Create availability entries for extended period
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    // Check if this date has a specific booking
    const bookingId = bookingsByDate.get(dateStr);
    const hasSpecificBooking = !!bookingId;
    
    // Mark some other weekend dates as unavailable (booked) for variety
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isRandomBooking = !hasSpecificBooking && Math.random() < (isWeekend ? 0.25 : 0.08); // 25% weekend, 8% weekday booking rate
    
    const isBooked = hasSpecificBooking || isRandomBooking;
    
    availabilityData.push({
      date: new Date(date),
      isAvailable: !isBooked,
      blockedReason: isBooked ? 'Booked Event' : null,
      bookingId: hasSpecificBooking ? bookingId : null, // Link to specific booking
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