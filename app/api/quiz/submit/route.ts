import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST - Submit quiz answers and validate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, answers, timeTakenSeconds } = body;

    if (!sessionToken || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Session token and answers are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 400 }
      );
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Quiz session has expired' },
        { status: 400 }
      );
    }

    // Check if already completed
    if (session.completed) {
      return NextResponse.json(
        { error: 'Quiz already completed' },
        { status: 400 }
      );
    }

    // Fetch correct answers for assigned questions
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('id, correct_answer')
      .in('id', session.questions_assigned);

    if (questionsError || !questions) {
      return NextResponse.json(
        { error: 'Failed to fetch question answers' },
        { status: 500 }
      );
    }

    // Create a map of correct answers
    const correctAnswers: Record<string, string> = {};
    questions.forEach(q => {
      correctAnswers[q.id] = q.correct_answer;
    });

    // Calculate score
    let score = 0;
    const answersSubmitted: Record<string, string> = {};

    session.questions_assigned.forEach((questionId: string) => {
      const userAnswer = answers[questionId];
      const correctAnswer = correctAnswers[questionId];
      
      answersSubmitted[questionId] = userAnswer || '';
      
      if (userAnswer && userAnswer.toUpperCase() === correctAnswer) {
        score++;
      }
    });

    const passed = score >= 7; // Need 7/10 to pass

    // Create quiz attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        raffle_id: session.raffle_id,
        user_id: session.user_id,
        wallet_address: session.wallet_address,
        ip_address: session.ip_address,
        questions_used: session.questions_assigned,
        answers_submitted: answersSubmitted,
        score: score,
        passed: passed,
        time_taken_seconds: timeTakenSeconds || null,
      })
      .select()
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'Failed to save quiz attempt' },
        { status: 500 }
      );
    }

    // Update session as completed
    await supabase
      .from('quiz_sessions')
      .update({
        completed: true,
        attempt_id: attempt.id,
      })
      .eq('id', session.id);

    return NextResponse.json({
      success: true,
      passed: passed,
      score: score,
      totalQuestions: session.questions_assigned.length,
      attemptId: attempt.id,
    });
  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}

