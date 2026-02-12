import { useState } from 'react';
import { useGetAllUserProfiles } from '../hooks/useUserSearch';
import UserCard from '../components/UserCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';

export default function UserDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: profiles, isLoading } = useGetAllUserProfiles();

  const filteredProfiles = profiles?.filter((profile) =>
    profile.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Find People</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && filteredProfiles && filteredProfiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}

          {!isLoading && filteredProfiles && filteredProfiles.length > 0 && (
            <div className="space-y-3">
              {filteredProfiles.map((profile) => (
                <UserCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
