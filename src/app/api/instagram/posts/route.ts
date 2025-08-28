import { NextResponse } from 'next/server';

export async function GET() {
  // Return mock Instagram posts for development
  const mockPosts = [
    {
      id: '1',
      permalink: 'https://www.instagram.com/p/mock1/',
      media_url: '/images/dj-setup-wedding.jpg',
      caption: 'Amazing wedding reception at Grand Ballroom! 🎉 #DapperSquad #Wedding',
      timestamp: '2024-08-15T10:30:00Z',
    },
    {
      id: '2', 
      permalink: 'https://www.instagram.com/p/mock2/',
      media_url: '/images/karaoke-corporate.jpg',
      caption: 'Corporate karaoke night was a huge success! 🎤 #TeamBuilding',
      timestamp: '2024-08-10T18:45:00Z',
    },
    {
      id: '3',
      permalink: 'https://www.instagram.com/p/mock3/',
      media_url: '/images/photography-anniversary.jpg', 
      caption: 'Capturing beautiful memories at this anniversary celebration 📸',
      timestamp: '2024-08-05T14:20:00Z',
    }
  ];

  return NextResponse.json({
    success: true,
    posts: mockPosts,
  });
}