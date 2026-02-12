import { useGetIncomingRequests, useGetOutgoingRequests } from '../hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendRequestCard from '../components/FriendRequestCard';
import { Loader2 } from 'lucide-react';

export default function FriendRequestsPage() {
  const { data: incomingRequests, isLoading: incomingLoading } = useGetIncomingRequests();
  const { data: outgoingRequests, isLoading: outgoingLoading } = useGetOutgoingRequests();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Follower Request</CardTitle>
          <CardDescription>
            Manage your incoming and outgoing follower requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="incoming">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="incoming">
                Incoming {incomingRequests && `(${incomingRequests.length})`}
              </TabsTrigger>
              <TabsTrigger value="outgoing">
                Outgoing {outgoingRequests && `(${outgoingRequests.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-3 mt-6">
              {incomingLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {!incomingLoading && incomingRequests && incomingRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No incoming requests
                </div>
              )}
              {!incomingLoading && incomingRequests && incomingRequests.length > 0 && (
                incomingRequests.map((request) => (
                  <FriendRequestCard key={request.id} request={request} type="incoming" />
                ))
              )}
            </TabsContent>

            <TabsContent value="outgoing" className="space-y-3 mt-6">
              {outgoingLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {!outgoingLoading && outgoingRequests && outgoingRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No outgoing requests
                </div>
              )}
              {!outgoingLoading && outgoingRequests && outgoingRequests.length > 0 && (
                outgoingRequests.map((request) => (
                  <FriendRequestCard key={request.id} request={request} type="outgoing" />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
