#!/usr/bin/env node

/**
 * Script to create 100 USDT Speed Tournament raffle
 * Run with: node create-100-usdt-tournament.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createRaffle() {
  console.log('🚀 Creating 100 USDT Speed Tournament...\n');

  const now = new Date();
  const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const raffleData = {
    title: '100 USDT Speed Tournament',
    description: `Fast-paced skill tournament with 100 USDT prize pool! 🚀

💰 Prize Pool: 100 USDT
🎫 Entry Fee: 2 USDT
📊 Total Tickets: 100
🎁 FREE Tickets: First 10 entries (10%)
⏱️ Duration: 7 days
🧠 Skill Required: Pass quiz (2/3 correct)

This is a speed tournament - first 100 skilled participants win their chance at the 100 USDT prize pool. The first 10 entries are completely FREE after passing the skill quiz!

How to Enter:
1. Pass the skill-based quiz (2/3 questions correct)
2. If you're in the first 10 entries, you get in FREE!
3. After first 10, pay 2 USDT per entry
4. Winner drawn automatically after 7 days

Good luck! 🍀`,
    image_url: 'https://puofbkubhtkynvdlwquu.supabase.co/storage/v1/object/public/raffle-images/FREE%20DOWNLOAD%20!!!%203D%20Cryptocurrency%20Icon%20Pack%20_%20Tether%20USDT.jpeg',
    prize_pool_amount: 100,
    prize_pool_symbol: 'USDT',
    ticket_price: 2,
    max_tickets: 100,
    status: 'live',
    starts_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
    receiving_address: '0x842bab27dE95e329eb17733c1f29c082e5dd94c3',
    raffle_type: 'skill',
    free_ticket_percentage: 10,
    entry_limit_per_wallet: 20,
  };

  console.log('📋 Raffle Details:');
  console.log('  Title:', raffleData.title);
  console.log('  Prize Pool:', raffleData.prize_pool_amount, raffleData.prize_pool_symbol);
  console.log('  Entry Fee:', raffleData.ticket_price, raffleData.prize_pool_symbol);
  console.log('  Max Tickets:', raffleData.max_tickets);
  console.log('  Free Tickets:', `${raffleData.free_ticket_percentage}% (first ${Math.floor(raffleData.max_tickets * 0.1)} tickets)`);
  console.log('  Duration:', '7 days');
  console.log('  Ends At:', endsAt.toLocaleString());
  console.log('  Type:', raffleData.raffle_type);
  console.log('  Status:', raffleData.status);
  console.log('');

  try {
    const { data, error } = await supabase
      .from('raffles')
      .insert(raffleData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating raffle:', error);
      process.exit(1);
    }

    console.log('✅ Raffle created successfully!');
    console.log('');
    console.log('📊 Created Raffle:');
    console.log('  ID:', data.id);
    console.log('  Title:', data.title);
    console.log('  Prize Pool:', data.prize_pool_amount, data.prize_pool_symbol);
    console.log('  Entry Fee:', data.ticket_price, data.prize_pool_symbol);
    console.log('  Max Tickets:', data.max_tickets);
    console.log('  Free Tickets:', `${data.free_ticket_percentage}% (first ${Math.floor(data.max_tickets * data.free_ticket_percentage / 100)} tickets)`);
    console.log('  Status:', data.status);
    console.log('  Ends At:', new Date(data.ends_at).toLocaleString());
    console.log('');
    console.log('🎉 The raffle is now LIVE on your platform!');
    console.log('');
    console.log('🔗 View at: https://your-domain.com/raffles/' + data.id);

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

createRaffle();
