import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useProfiles';
import { useGetUnreadCount } from '../hooks/useNotifications';
import LoginButton from './LoginButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Bell, User, Settings, Menu, Search } from 'lucide-react';
import { useState } from 'react';

export default function AppHeader() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const unreadCount = useGetUnreadCount();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-6xl">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-green-600 dark:text-green-500">
            SpellCastersCCG
          </span>
        </Link>

        {isAuthenticated && (
          <>
            {/* Desktop Navigation */}
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
                <Search className="h-4 w-4" />
                Discover
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/notifications' })}
                className="gap-2 relative"
              >
                <Bell className="h-4 w-4" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/settings' })}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
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

            {/* Mobile Navigation */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col space-y-2 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/feed')}
                    className="justify-start gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Feed
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/directory')}
                    className="justify-start gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Discover
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/profile')}
                    className="justify-start gap-2"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/notifications')}
                    className="justify-start gap-2 relative"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation('/settings')}
                    className="justify-start gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </>
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
