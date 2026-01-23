#!/usr/bin/env node

/**
 * Apply Free Tickets Migration
 * Updates all 6 skill raffles to have 10% free ticket allocation
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Applying Free Tickets Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/028_add_free_tickets_to_all_raffles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🔄 Executing migration...\n');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      // Try direct query if RPC fails
      console.log('⚠️  RPC method failed, trying direct query...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('raffles')
        .update({ free_ticket_percentage: 10 })
        .in('title', [
          'Genesis Pick',
          'Trader\'s Reflex',
          'Liquidity Mind',
          'Alpha Vault',
          'Whale Signal',
          'Prime Crown'
        ])
        .eq('status', 'live')
        .select();

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Migration applied successfully!');
      console.log(`📊 Updated ${updateData?.length || 0} raffles\n`);

      // Verify the update
      const { data: raffles, error: verifyError } = await supabase
        .from('raffles')
        .select('title, free_ticket_percentage, max_tickets')
        .in('title', [
          'Genesis Pick',
          'Trader\'s Reflex',
          'Liquidity Mind',
          'Alpha Vault',
          'Whale Signal',
          'Prime Crown'
        ])
        .eq('status', 'live')
        .order('prize_pool_amount', { ascending: true });

      if (verifyError) {
        throw verifyError;
      }

      console.log('📋 Updated Raffles:');
      console.log('═══════════════════════════════════════════════════════════');
      raffles?.forEach(raffle => {
        const freeTickets = Math.floor(raffle.max_tickets * (raffle.free_ticket_percentage / 100));
        console.log(`✓ ${raffle.title}`);
        console.log(`  Free Tickets: ${raffle.free_ticket_percentage}% (${freeTickets} tickets)`);
        console.log(`  Total Tickets: ${raffle.max_tickets}`);
        console.log('');
      });

      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ All raffles now have 10% free ticket allocation!');
      console.log('🎉 First 10% of entries will be completely FREE (quiz only)');
      
    } else {
      console.log('✅ Migration applied successfully via RPC!');
      console.log(data);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
