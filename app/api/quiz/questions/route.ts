import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// POST - Fetch random questions for a quiz session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raffleId, walletAddress, ipAddress: clientIpAddress, count = 10 } = body;
    
    // Get IP from headers (more reliable)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0] || realIp || clientIpAddress || null;

    if (!raffleId || !walletAddress) {
      return NextResponse.json(
        { error: 'Raffle ID and wallet address are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get or create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    let userId: string;
    if (userError || !userData) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress.toLowerCase() })
        .select('id')
        .single();

      if (createError || !newUser) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
      userId = newUser.id;
    } else {
      userId = userData.id;
    }

    // Get all active questions
    const { data: allQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (questionsError || !allQuestions || allQuestions.length < count) {
      return NextResponse.json(
        { error: 'Not enough questions available' },
        { status: 500 }
      );
    }

    // Get questions that this user/IP has NOT seen before for this raffle
    // Use separate queries and combine results to avoid .or() syntax issues
    const { data: attemptsByUser } = await supabase
      .from('quiz_attempts')
      .select('questions_used')
      .eq('raffle_id', raffleId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    const { data: attemptsByWallet } = await supabase
      .from('quiz_attempts')
      .select('questions_used')
      .eq('raffle_id', raffleId)
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(10);
    
    const previousAttempts = [...(attemptsByUser || []), ...(attemptsByWallet || [])];

    // Collect all previously used question IDs
    const usedQuestionIds = new Set<string>();
    previousAttempts?.forEach(attempt => {
      if (Array.isArray(attempt.questions_used)) {
        attempt.questions_used.forEach((id: string) => usedQuestionIds.add(id));
      }
    });

    // Filter out previously used questions
    const availableQuestions = allQuestions.filter(
      q => !usedQuestionIds.has(q.id)
    );

    // If not enough unused questions, use all questions (shuffle)
    const questionsToUse = availableQuestions.length >= count
      ? availableQuestions
      : allQuestions;

    // Shuffle and select random questions
    const shuffled = [...questionsToUse].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, count);

    // Create a quiz session
    const sessionToken = `${raffleId}-${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        raffle_id: raffleId,
        user_id: userId,
        wallet_address: walletAddress.toLowerCase(),
        ip_address: ipAddress || null,
        session_token: sessionToken,
        questions_assigned: selectedQuestions.map(q => q.id),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Failed to create quiz session' },
        { status: 500 }
      );
    }

    // Return questions without correct answers
    const questionsForUser = selectedQuestions.map(q => ({
      id: q.id,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    }));

    return NextResponse.json({
      success: true,
      sessionToken,
      questions: questionsForUser,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching quiz questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// GET - Admin: Fetch all questions (for management)
export async function GET(request: NextRequest) {
  try {
    // Verify admin PIN
    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json(
        { error: 'Admin PIN not configured' },
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ questions: data || [] });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

