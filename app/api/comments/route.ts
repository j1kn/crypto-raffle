import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/comments?page=1&limit=100&showAll=true
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const showAll = searchParams.get('showAll') === 'true';

    const supabase = createServerClient();
    
    // For initial view, show 4-5 comments
    const initialLimit = showAll ? limit : 5;
    const offset = showAll ? (page - 1) * limit : 0;

    // Fetch comments with pagination
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + initialLimit - 1);

    if (commentsError) throw commentsError;

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    const totalPages = showAll ? Math.ceil((count || 0) / limit) : 1;
    const hasMore = showAll ? page < totalPages : (count || 0) > initialLimit;

    return NextResponse.json({
      comments: comments || [],
      pagination: {
        page,
        limit: initialLimit,
        total: count || 0,
        totalPages,
        hasMore,
      },
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, commentText, displayName } = body;

    if (!walletAddress || !commentText || !commentText.trim()) {
      return NextResponse.json(
        { error: 'walletAddress and commentText are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get or create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    let userId;
    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ wallet_address: walletAddress.toLowerCase() })
        .select('id')
        .single();

      if (createError) throw createError;
      userId = newUser.id;
    } else if (userError) {
      throw userError;
    } else {
      userId = userData.id;
    }

    // Insert comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        wallet_address: walletAddress.toLowerCase(),
        display_name: displayName || null,
        comment_text: commentText.trim(),
      })
      .select()
      .single();

    if (commentError) throw commentError;

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message },
      { status: 500 }
    );
  }
}

