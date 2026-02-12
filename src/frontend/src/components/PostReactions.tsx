import { useGetReactionsForPost, useGetCallerReactionForPost, useToggleReaction } from '../hooks/useReactions';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PostReactionsProps {
  postId: string;
}

export default function PostReactions({ postId }: PostReactionsProps) {
  const { identity } = useInternetIdentity();
  const { data: reactions } = useGetReactionsForPost(postId);
  const { data: callerReaction } = useGetCallerReactionForPost(postId);
  const { mutate: toggleReaction, isPending } = useToggleReaction();

  const isAuthenticated = !!identity;
  const hasReacted = !!callerReaction;
  const reactionCount = reactions?.length || 0;

  const handleToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to react to posts');
      return;
    }

    toggleReaction(
      { postId, hasReacted },
      {
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update reaction');
        },
      }
    );
  };

  return (
    <Button
      variant={hasReacted ? 'default' : 'ghost'}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${hasReacted ? 'fill-current' : ''}`} />
      )}
      <span>{reactionCount}</span>
    </Button>
  );
}
