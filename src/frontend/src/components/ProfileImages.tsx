import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileImagesProps {
  coverUrl?: string;
  avatarUrl?: string;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfileImages({ coverUrl, avatarUrl, displayName, size = 'md' }: ProfileImagesProps) {
  const defaultCover = '/assets/generated/default-cover.dim_1200x300.png';
  const defaultAvatar = '/assets/generated/default-avatar.dim_256x256.png';

  const sizeClasses = {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-48',
  };

  const avatarSizes = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const avatarPositions = {
    sm: '-bottom-8',
    md: '-bottom-12',
    lg: '-bottom-16',
  };

  return (
    <div className="relative">
      <div className={`w-full ${sizeClasses[size]} bg-muted overflow-hidden`}>
        <img
          src={coverUrl || defaultCover}
          alt="Cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== defaultCover) {
              target.src = defaultCover;
            }
          }}
        />
      </div>
      <div className={`absolute ${avatarPositions[size]} left-6`}>
        <Avatar className={`${avatarSizes[size]} border-4 border-background`}>
          <AvatarImage 
            src={avatarUrl || defaultAvatar} 
            alt={displayName}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== defaultAvatar) {
                target.src = defaultAvatar;
              }
            }}
          />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
