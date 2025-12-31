'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { MessageSquare, Send, User, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  wallet_address: string;
  display_name?: string | null;
  comment_text: string;
  created_at: string;
}

interface CommentsSectionProps {
  initialLimit?: number;
  perPage?: number;
}

export default function CommentsSection({ 
  initialLimit = 5, 
  perPage = 100 
}: CommentsSectionProps) {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const fetchComments = async (page: number = 1, all: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/comments?page=${page}&limit=${perPage}&showAll=${all}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }

      setComments(data.comments || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setHasMore(data.pagination?.hasMore || false);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1, showAll);
  }, [showAll]);

  const handleShowMore = () => {
    setShowAll(true);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchComments(newPage, true);
      // Scroll to top of comments section
      const commentsSection = document.getElementById('comments-section');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      open();
      return;
    }

    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Get user profile for display name
      let displayName = null;
      try {
        const profileResponse = await fetch(`/api/profile?walletAddress=${address}`);
        const profileData = await profileResponse.json();
        displayName = profileData.profile?.display_name || null;
      } catch (profileErr) {
        // Continue without display name if profile fetch fails
        console.warn('Failed to fetch profile:', profileErr);
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          commentText: newComment.trim(),
          displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      // Reset form and refresh comments
      setNewComment('');
      await fetchComments(showAll ? currentPage : 1, showAll);
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      setError(err.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!address) return;
    
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      setError(null);

      const response = await fetch(`/api/comments?id=${commentId}&walletAddress=${address}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete comment');
      }

      // Refresh comments after deletion
      await fetchComments(showAll ? currentPage : 1, showAll);
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.message || 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <section id="comments-section" className="bg-primary-darker border-t border-primary-gray py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-primary-green" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              USER COMMENTS
            </h2>
          </div>
          <p className="text-gray-400">
            Share your thoughts and experiences with the PrimePick community
          </p>
        </div>

        {/* Comment Form */}
        <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                isConnected
                  ? "Write your comment here..."
                  : "Connect your wallet to leave a comment"
              }
              className="w-full px-4 py-3 bg-primary-darker border border-primary-lightgray rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent resize-none"
              rows={4}
              disabled={!isConnected || submitting}
            />
            
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {isConnected ? (
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {formatWalletAddress(address || '')}
                  </span>
                ) : (
                  <span>Please connect your wallet to comment</span>
                )}
              </div>
              <button
                type="submit"
                disabled={!isConnected || submitting || !newComment.trim()}
                className="flex items-center gap-2 bg-primary-green text-primary-darker px-6 py-2 rounded-lg font-semibold hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    POSTING...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    POST COMMENT
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {comments.map((comment) => {
                const isOwnComment = address?.toLowerCase() === comment.wallet_address.toLowerCase();
                return (
                  <div
                    key={comment.id}
                    className="bg-primary-gray border border-primary-lightgray rounded-lg p-5 hover:border-primary-green/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-green/20 flex items-center justify-center flex-shrink-0 border-2 border-primary-green/30">
                        <User className="w-6 h-6 text-primary-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-white font-semibold text-lg">
                              {comment.display_name || formatWalletAddress(comment.wallet_address)}
                            </h4>
                            {comment.display_name && (
                              <span className="text-gray-500 text-sm font-mono">
                                {formatWalletAddress(comment.wallet_address)}
                              </span>
                            )}
                            <span className="text-gray-400 text-sm">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          {isOwnComment && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
                              title="Delete comment"
                            >
                              {deletingCommentId === comment.id ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                          {comment.comment_text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More / Pagination */}
            {!showAll && hasMore && (
              <div className="text-center">
                <button
                  onClick={handleShowMore}
                  className="bg-primary-green text-primary-darker px-8 py-3 rounded-lg font-semibold hover:bg-primary-green/90 transition-colors"
                >
                  SHOW ALL COMMENTS
                </button>
              </div>
            )}

            {showAll && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 bg-primary-gray border border-primary-lightgray text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 bg-primary-gray border border-primary-lightgray text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

