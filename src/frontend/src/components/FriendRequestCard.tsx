import { Principal } from '@dfinity/principal';
import { useGetUserProfile } from '../hooks/useProfiles';
import { useAcceptFriendRequest, useDeclineFriendRequest, useCancelFriendRequest, type FriendRequest } from '../hooks/useFriends';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface FriendRequestCardProps {
  request: FriendRequest;
  type: 'incoming' | 'outgoing';
}

export default function FriendRequestCard({ request, type }: FriendRequestCardProps) {
  const { data: profile } = useGetUserProfile(request.principal);
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptFriendRequest();
  const { mutate: declineRequest, isPending: isDeclining } = useDeclineFriendRequest();
  const { mutate: cancelRequest, isPending: isCanceling } = useCancelFriendRequest();
  const navigate = useNavigate();

  if (!profile) return null;

  const isPending = isAccepting || isDeclining || isCanceling;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar
            className="h-12 w-12 cursor-pointer"
            onClick={() => navigate({ to: '/user/$userId', params: { userId: request.principal.toString() } })}
          >
            <AvatarImage
              src={profile.avatarBlob?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'}
              alt={profile.displayName}
            />
            <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{profile.displayName}</p>
            {profile.bio && (
              <p className="text-sm text-muted-foreground truncate">{profile.bio}</p>
            )}
          </div>

          <div className="flex gap-2">
            {type === 'incoming' ? (
              <>
                <Button
                  size="sm"
                  onClick={() => acceptRequest(request.principal)}
                  disabled={isPending}
                  className="gap-2"
                >
                  {isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => declineRequest(request.principal)}
                  disabled={isPending}
                  className="gap-2"
                >
                  {isDeclining ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Decline
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => cancelRequest(request.principal)}
                disabled={isPending}
              >
                {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
