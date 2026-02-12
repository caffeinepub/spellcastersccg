import { useState } from 'react';
import { useGetCommentsForPost, useAddComment, useDeleteComment } from '../hooks/useComments';
import { useGetUserProfile } from '../hooks/useProfiles';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MessageCircle, Loader2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../backend';
import { toast } from 'sonner';

interface PostCommentsProps {
  postId: string;
  postAuthor: string;
}

function CommentItem({ comment, postAuthor }: { comment: Comment; postAuthor: string }) {
  const { data: authorProfile } = useGetUserProfile(comment.author);
  const { identity } = useInternetIdentity();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

  const timeAgo = formatDistanceToNow(new Date(Number(comment.timestamp) / 1000000), {
    addSuffix: true,
  });

  const isOwnComment = identity?.getPrincipal().toString() === comment.author.toString();
  const isPostAuthor = identity?.getPrincipal().toString() === postAuthor;
  const canDelete = isOwnComment || isPostAuthor;

  const handleDelete = () => {
    if (confirm('Delete this comment?')) {
      deleteComment(
        { commentId: comment.id, postId: comment.postId },
        {
          onError: (error: any) => {
            toast.error(error.message || 'Failed to delete comment');
          },
        }
      );
    }
  };

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={authorProfile?.avatarBlob?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'}
          alt={authorProfile?.displayName || 'User'}
        />
        <AvatarFallback>{authorProfile?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm">{authorProfile?.displayName || 'Unknown User'}</span>
            <span className="text-xs text-muted-foreground ml-2">{timeAgo}</span>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-7 w-7 p-0"
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              )}
            </Button>
          )}
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
}

export default function PostComments({ postId, postAuthor }: PostCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { identity } = useInternetIdentity();
  const { data: comments, isLoading } = useGetCommentsForPost(postId);
  const { mutate: addComment, isPending: isAdding } = useAddComment();

  const isAuthenticated = !!identity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;

    addComment(
      { postId, content: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText('');
          toast.success('Comment added');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to add comment');
        },
      }
    );
  };

  const commentCount = comments?.length || 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t pt-3">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span>
            {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 mt-3">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && comments && comments.length > 0 && (
          <div className="divide-y">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} postAuthor={postAuthor} />
            ))}
          </div>
        )}

        {!isLoading && comments && comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
        )}

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={isAdding}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!commentText.trim() || isAdding}>
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post Comment'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">Sign in to comment</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
