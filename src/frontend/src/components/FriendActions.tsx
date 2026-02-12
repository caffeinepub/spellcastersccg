import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useSendFriendRequest,
  useCancelFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useGetFriendshipStatus,
} from '../hooks/useFriends';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserMinus, UserCheck, X, Check } from 'lucide-react';

interface FriendActionsProps {
  targetUser: Principal;
}

export default function FriendActions({ targetUser }: FriendActionsProps) {
  const { identity } = useInternetIdentity();
  const { data: status, isLoading } = useGetFriendshipStatus(targetUser);
  const { mutate: sendRequest, isPending: isSending } = useSendFriendRequest();
  const { mutate: cancelRequest, isPending: isCanceling } = useCancelFriendRequest();
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptFriendRequest();
  const { mutate: declineRequest, isPending: isDeclining } = useDeclineFriendRequest();

  if (!identity || isLoading) {
    return null;
  }

  const isSelf = identity.getPrincipal().toString() === targetUser.toString();
  if (isSelf) {
    return null;
  }

  const isPending = isSending || isCanceling || isAccepting || isDeclining;

  if (status?.isFriend) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UserCheck className="h-4 w-4" />
        Friends
      </div>
    );
  }

  if (status?.hasIncomingRequest) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => acceptRequest(targetUser)}
          disabled={isPending}
          className="gap-2"
        >
          {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => declineRequest(targetUser)}
          disabled={isPending}
          className="gap-2"
        >
          {isDeclining ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Decline
        </Button>
      </div>
    );
  }

  if (status?.hasOutgoingRequest) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => cancelRequest(targetUser)}
        disabled={isPending}
        className="gap-2"
      >
        {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
        Cancel Request
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => sendRequest(targetUser)}
      disabled={isPending}
      className="gap-2"
    >
      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
      Add Friend
    </Button>
  );
}
