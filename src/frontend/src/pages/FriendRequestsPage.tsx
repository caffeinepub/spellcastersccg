import { useGetIncomingRequests, useGetOutgoingRequests } from '../hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendRequestCard from '../components/FriendRequestCard';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FriendRequestsPage() {
  const { data: incomingRequests, isLoading: incomingLoading } = useGetIncomingRequests();
  const { data: outgoingRequests, isLoading: outgoingLoading } = useGetOutgoingRequests();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Friend Requests</CardTitle>
          <CardDescription>
            Manage your incoming and outgoing friend requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Friend request tracking is currently limited. You can send and accept requests from user profiles.
            </AlertDescription>
          </Alert>

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
