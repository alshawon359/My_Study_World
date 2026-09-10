import { NextRequest, NextResponse } from 'next/server';
import { getBDDateString } from '@/lib/date-utils';

/**
 * Force task regeneration for today (BD timezone)
 * Call this after creating/updating/deleting schedule blocks
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const dateStr = getBDDateString(); // Use BD date instead of UTC
    
    console.log(`🔄 Syncing tasks for user ${userId}, date ${dateStr} (BD time)`);
    
    // Call the generate API internally
    const generateRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tasks/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date: dateStr }),
    });

    if (!generateRes.ok) {
      const error = await generateRes.json();
      console.error('❌ Task generation failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.error || 'Generation failed' 
      }, { status: 500 });
    }

    const result = await generateRes.json();
    console.log(`✅ Tasks synced: ${result.count} tasks`);

    return NextResponse.json({
      success: true,
      count: result.count,
      tasks: result.tasks,
    });
  } catch (error: any) {
    console.error('❌ Sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
