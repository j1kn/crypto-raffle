import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Verify admin PIN
function verifyAdmin() {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    throw new Error('Admin PIN not configured');
  }
  return true;
}

// PUT - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    verifyAdmin();

    const body = await request.json();
    const { question, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, is_active } = body;

    // Handle both sync and async params (Next.js 14+ compatibility)
    const resolvedParams = 'then' in params ? await params : params;
    const questionId = resolvedParams.id;

    if (correct_answer && !['A', 'B', 'C', 'D'].includes(correct_answer.toUpperCase())) {
      return NextResponse.json(
        { error: 'Correct answer must be A, B, C, or D' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'SUPABASE_URL is required' },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is required' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const updateData: any = {};
    if (question !== undefined) updateData.question = question;
    if (option_a !== undefined) updateData.option_a = option_a;
    if (option_b !== undefined) updateData.option_b = option_b;
    if (option_c !== undefined) updateData.option_c = option_c;
    if (option_d !== undefined) updateData.option_d = option_d;
    if (correct_answer !== undefined) updateData.correct_answer = correct_answer.toUpperCase();
    if (category !== undefined) updateData.category = category;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, question: data });
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    verifyAdmin();

    // Handle both sync and async params (Next.js 14+ compatibility)
    const resolvedParams = 'then' in params ? await params : params;
    const questionId = resolvedParams.id;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'SUPABASE_URL is required' },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is required' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete question' },
      { status: 500 }
    );
  }
}

