import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json(
        { success: false, error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Get admin PIN from environment variable
    const adminPin = process.env.ADMIN_PIN || '';
    
    if (!adminPin) {
      console.error('ADMIN_PIN environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Admin PIN not configured' },
        { status: 500 }
      );
    }

    // Compare PIN (case-sensitive)
    if (pin === adminPin) {
      // Generate a session token
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return NextResponse.json({
        success: true,
        sessionToken,
        message: 'Access granted',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify PIN' },
      { status: 500 }
    );
  }
}

