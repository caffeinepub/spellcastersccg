import { useState } from 'react';
import { useSearchUserProfiles } from '../hooks/useUserSearch';
import UserCard from '../components/UserCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search } from 'lucide-react';

export default function UserDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { data: profiles, isLoading } = useSearchUserProfiles(searchQuery);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && profiles && profiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}

          {!isLoading && profiles && profiles.length > 0 && (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <UserCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
