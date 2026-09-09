import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Initializing user...');
    
    const userId = 'cmtszibhe0000uzf04p06d1fe';

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('User not found, creating...');
      user = await prisma.user.create({
        data: {
          id: userId,
          email: 'user@studyworld.com',
          name: 'Study World User',
        },
      });
      console.log('✅ User created:', user);
    } else {
      console.log('✅ User already exists:', user);
    }

    // Check if settings exist
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      console.log('Settings not found, creating...');
      settings = await prisma.userSettings.create({
        data: {
          userId,
          sleepStartTime: '01:00',
          sleepEndTime: '07:30',
          sleepTarget: 6.5,
          phoneLimit: 90,
          theme: 'dark',
        },
      });
      console.log('✅ Settings created:', settings);
    } else {
      console.log('✅ Settings already exist');
    }

    return NextResponse.json({
      success: true,
      user,
      settings,
      message: 'User initialized successfully',
    });
  } catch (error: any) {
    console.error('❌ Initialization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
