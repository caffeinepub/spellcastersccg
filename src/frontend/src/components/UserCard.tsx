import { useNavigate } from '@tanstack/react-router';
import { UserProfile } from '../backend';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface UserCardProps {
  profile: UserProfile;
}

export default function UserCard({ profile }: UserCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/user/$userId', params: { userId: profile.id } });
  };

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
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

          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
