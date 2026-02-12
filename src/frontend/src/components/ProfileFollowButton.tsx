import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useIsFollowing, useFollowUser, useUnfollowUser } from '../hooks/useFollow';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileFollowButtonProps {
  targetUser: Principal;
}

export default function ProfileFollowButton({ targetUser }: ProfileFollowButtonProps) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: isFollowing, isLoading: followStatusLoading } = useIsFollowing(targetUser);
  const { mutate: followUser, isPending: isFollowPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowPending } = useUnfollowUser();

  // Don't render if actor or identity not ready
  if (!identity || !actor || actorFetching) {
    return null;
  }

  // Don't render for own profile
  const isSelf = identity.getPrincipal().toString() === targetUser.toString();
  if (isSelf) {
    return null;
  }

  const isPending = isFollowPending || isUnfollowPending;
  const isLoading = followStatusLoading || actorFetching;

  const handleFollow = () => {
    followUser(targetUser, {
      onError: (error: any) => {
        const message = error.message || 'Failed to follow user';
        toast.error(message);
      },
    });
  };

  const handleUnfollow = () => {
    unfollowUser(targetUser, {
      onError: (error: any) => {
        const message = error.message || 'Failed to unfollow user';
        toast.error(message);
      },
    });
  };

  if (isLoading) {
    return (
      <Button size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading
      </Button>
    );
  }

  if (isFollowing) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleUnfollow}
        disabled={isPending}
        className="gap-2"
      >
        {isUnfollowPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
        Unfollow
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleFollow}
      disabled={isPending}
      className="gap-2"
    >
      {isFollowPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      Follow
    </Button>
  );
}
