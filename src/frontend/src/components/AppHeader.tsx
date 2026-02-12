import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useProfiles';
import LoginButton from './LoginButton';
import { Button } from '@/components/ui/button';
import { Home, Users, Bell, User } from 'lucide-react';

export default function AppHeader() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-6xl">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-600 dark:text-green-500">
            SpellCastersCCG
          </span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/feed' })}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Feed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/directory' })}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Find People
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/requests' })}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              Requests
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/profile' })}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              My Profile
            </Button>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated && !isLoading && userProfile && (
            <span className="text-sm font-medium hidden sm:inline-block">
              {userProfile.displayName}
            </span>
          )}
          <LoginButton />
        </div>
      </div>
    </header>
  );
}
