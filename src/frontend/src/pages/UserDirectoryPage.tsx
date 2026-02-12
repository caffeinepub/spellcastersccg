import { useState, useMemo, useEffect } from 'react';
import { useSearchUserProfiles } from '../hooks/useUserSearch';
import { useGetFollowing } from '../hooks/useFollow';
import { useDiscoverSignals } from '../hooks/useDiscoverSignals';
import UserCard from '../components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Users, AlertCircle } from 'lucide-react';
import { useActor } from '../hooks/useActor';

export default function UserDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedQuery = searchQuery.trim();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: profiles, isLoading: profilesLoading, error: profilesError, refetch: refetchProfiles, isFetched } = useSearchUserProfiles(trimmedQuery);
  const { data: following, isLoading: followingLoading, error: followingError, refetch: refetchFollowing } = useGetFollowing();
  const { recordSearch } = useDiscoverSignals();

  // Record search signal when trimmed query changes (debounced effect)
  useEffect(() => {
    if (!trimmedQuery) return;
    
    const timeoutId = setTimeout(() => {
      recordSearch(trimmedQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [trimmedQuery, recordSearch]);

  const followingSet = useMemo(() => {
    if (!following) return new Set<string>();
    return new Set(following.map(p => p.toString()));
  }, [following]);

  const followingProfiles = useMemo(() => {
    if (!profiles) return [];
    return profiles.filter(profile => followingSet.has(profile.id));
  }, [profiles, followingSet]);

  const allProfiles = profiles || [];
  const isLoading = actorFetching || profilesLoading || followingLoading;
  const hasError = profilesError || followingError;

  // Show loading state while actor is initializing
  if (actorFetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Discover Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Loading directory...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Discover Users</CardTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by display name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={!actor}
            />
          </div>
        </CardHeader>
        <CardContent>
          {hasError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to load directory</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>There was a problem loading the user directory. Please try again.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchProfiles();
                    refetchFollowing();
                  }}
                  className="ml-4"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="all" disabled={!actor}>
                All Users {!isLoading && isFetched && allProfiles.length > 0 && `(${allProfiles.length})`}
              </TabsTrigger>
              <TabsTrigger value="following" disabled={!actor}>
                Following {!isLoading && followingProfiles.length > 0 && `(${followingProfiles.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && !hasError && allProfiles.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {trimmedQuery ? 'No users found matching your search' : 'No users found'}
                  </p>
                </div>
              )}

              {!isLoading && !hasError && allProfiles.length > 0 && (
                <div className="space-y-3">
                  {allProfiles.map((profile) => (
                    <UserCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-3">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && !hasError && followingProfiles.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {trimmedQuery 
                      ? 'No users you follow match your search' 
                      : "You're not following anyone yet"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Search for users to follow and see their posts in your feed
                  </p>
                </div>
              )}

              {!isLoading && !hasError && followingProfiles.length > 0 && (
                <div className="space-y-3">
                  {followingProfiles.map((profile) => (
                    <UserCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
