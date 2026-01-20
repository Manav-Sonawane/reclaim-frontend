'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Send, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  itemId: string;
}

export default function CommentSection({ itemId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/items/${itemId}/comments`);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await api.post(`/items/${itemId}/comments`, {
        content: newComment,
      });
      setComments([data, ...comments]);
      setNewComment('');
      setCharCount(0);
      toast.success('Comment added');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 1000) {
      setNewComment(val);
      setCharCount(val.length);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={handleInputChange}
                className="w-full min-h-[100px] p-4 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                placeholder="Ask a question or share information..."
                disabled={submitting}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {charCount}/1000
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center text-sm text-gray-500">
            Please log in to post comments.
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading comments...</div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-4 p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden font-bold text-xs ring-2 ring-gray-50 dark:ring-gray-900">
                    {comment.user?.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={comment.user.profilePicture}
                        alt={comment.user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      comment.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase() || <User className="w-5 h-5" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justifying-between gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {comment.user.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              No comments yet. Be the first to start the discussion!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
