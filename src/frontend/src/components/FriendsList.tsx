import { Principal } from '@dfinity/principal';
import { useGetFriends } from '../hooks/useFriends';
import { useGetUserProfile } from '../hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface FriendsListProps {
  user: Principal;
}

function FriendItem({ friendPrincipal }: { friendPrincipal: Principal }) {
  const { data: profile } = useGetUserProfile(friendPrincipal);
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => navigate({ to: '/user/$userId', params: { userId: friendPrincipal.toString() } })}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage
          src={profile.avatarBlob?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'}
          alt={profile.displayName}
        />
        <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{profile.displayName}</p>
      </div>
    </div>
  );
}

export default function FriendsList({ user }: FriendsListProps) {
  const { data: friends, isLoading } = useGetFriends(user);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No friends yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((friendPrincipal) => (
        <FriendItem key={friendPrincipal.toString()} friendPrincipal={friendPrincipal} />
      ))}
    </div>
  );
}
