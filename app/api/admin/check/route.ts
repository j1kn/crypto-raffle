import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    const adminWallets = process.env.ADMIN_WALLETS?.split(',').map(w => w.trim().toLowerCase()) || [];
    const isAdmin = adminWallets.includes(walletAddress.toLowerCase());

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

