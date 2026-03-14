import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Check if user qualifies for free entry in this raffle
// Supports both GET and POST for flexibility
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const supabase = createServerClient();

    // Get raffle data
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('max_tickets, free_ticket_percentage, ticket_price')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffleData) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    const freeTicketPercentage = raffleData.free_ticket_percentage || 0;
    
    // If no free tickets, return immediately
    if (freeTicketPercentage === 0) {
      return NextResponse.json({
        isFreeEntry: false,
        freeTicketsRemaining: 0,
        totalFreeTickets: 0,
        ticketPrice: raffleData.ticket_price,
      });
    }

    // Calculate total tickets sold
    const { data: entriesData, error: entriesError } = await supabase
      .from('raffle_entries')
      .select('quantity')
      .eq('raffle_id', raffleId);

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      return NextResponse.json(
        { error: 'Failed to check ticket availability' },
        { status: 500 }
      );
    }

    const totalTicketsSold = (entriesData || []).reduce((sum, entry) => sum + (entry.quantity || 1), 0);
    const freeTicketLimit = Math.floor(raffleData.max_tickets * (freeTicketPercentage / 100));
    const freeTicketsRemaining = Math.max(0, freeTicketLimit - totalTicketsSold);
    const isFreeEntry = freeTicketsRemaining >= 1; // At least 1 free ticket available

    return NextResponse.json({
      isFreeEntry,
      freeTicketsRemaining,
      totalFreeTickets: freeTicketLimit,
      ticketsSold: totalTicketsSold,
      ticketPrice: raffleData.ticket_price,
      message: isFreeEntry
        ? `🎉 You qualify for FREE entry! (${freeTicketsRemaining} free tickets remaining)`
        : `All free tickets claimed. Entry costs ${raffleData.ticket_price} per ticket.`
    });
  } catch (error: any) {
    console.error('Error checking free entry:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to check free entry status' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raffleId = params.id;
    const body = await request.json();
    const { walletAddress, quantity } = body as {
      walletAddress?: string;
      quantity?: number;
    };

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing walletAddress' },
        { status: 400 }
      );
    }

    const ticketQuantity = quantity && quantity > 0 ? quantity : 1;
    const supabase = createServerClient();

    // Get raffle data
    const { data: raffleData, error: raffleError } = await supabase
      .from('raffles')
      .select('max_tickets, free_ticket_percentage, ticket_price')
      .eq('id', raffleId)
      .single();

    if (raffleError || !raffleData) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }

    const freeTicketPercentage = raffleData.free_ticket_percentage || 0;
    
    // If no free tickets, return immediately
    if (freeTicketPercentage === 0) {
      return NextResponse.json({
        isFreeEntry: false,
        freeTicketsRemaining: 0,
        totalFreeTickets: 0,
        ticketPrice: raffleData.ticket_price,
      });
    }

    // Calculate total tickets sold
    const { data: entriesData, error: entriesError } = await supabase
      .from('raffle_entries')
      .select('quantity')
      .eq('raffle_id', raffleId);

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      return NextResponse.json(
        { error: 'Failed to check ticket availability' },
        { status: 500 }
      );
    }

    const totalTicketsSold = (entriesData || []).reduce((sum, entry) => sum + (entry.quantity || 1), 0);
    const freeTicketLimit = Math.floor(raffleData.max_tickets * (freeTicketPercentage / 100));
    const freeTicketsRemaining = Math.max(0, freeTicketLimit - totalTicketsSold);
    const isFreeEntry = freeTicketsRemaining >= ticketQuantity;

    return NextResponse.json({
      isFreeEntry,
      freeTicketsRemaining,
      totalFreeTickets: freeTicketLimit,
      ticketsSold: totalTicketsSold,
      ticketPrice: raffleData.ticket_price,
      message: isFreeEntry 
        ? `🎉 You qualify for FREE entry! (${freeTicketsRemaining} free tickets remaining)`
        : freeTicketsRemaining > 0
        ? `Only ${freeTicketsRemaining} free tickets left. You'll need to pay for ${ticketQuantity - freeTicketsRemaining} ticket(s).`
        : `All free tickets claimed. Entry costs ${raffleData.ticket_price} per ticket.`
    });
  } catch (error: any) {
    console.error('Error checking free entry:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to check free entry status' },
      { status: 500 }
    );
  }
}
