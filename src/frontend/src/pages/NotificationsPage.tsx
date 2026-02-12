import { useGetCallerNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useNotifications';
import { useGetUserProfile } from '../hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Bell, UserPlus, MessageCircle, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../backend';
import { toast } from 'sonner';

function NotificationItem({ notification }: { notification: Notification }) {
  const { mutate: markAsRead, isPending } = useMarkNotificationAsRead();

  let fromPrincipal;
  let icon;
  let message;

  if (notification.notificationType.__kind__ === 'friendRequest') {
    fromPrincipal = notification.notificationType.friendRequest.from;
    icon = <UserPlus className="h-5 w-5 text-green-600" />;
    message = 'sent you a friend request';
  } else if (notification.notificationType.__kind__ === 'comment') {
    fromPrincipal = notification.notificationType.comment.commentAuthor;
    icon = <MessageCircle className="h-5 w-5 text-blue-600" />;
    message = 'commented on your post';
  }

  const { data: userProfile } = useGetUserProfile(fromPrincipal);

  const timeAgo = formatDistanceToNow(new Date(Number(notification.timestamp) / 1000000), {
    addSuffix: true,
  });

  const handleMarkAsRead = () => {
    markAsRead(notification.id, {
      onError: (error: any) => {
        toast.error(error.message || 'Failed to mark as read');
      },
    });
  };

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border ${
        notification.isRead ? 'bg-background' : 'bg-accent/50'
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>

      <Avatar className="h-10 w-10">
        <AvatarImage
          src={userProfile?.avatarBlob?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'}
          alt={userProfile?.displayName || 'User'}
        />
        <AvatarFallback>
          {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-semibold">{userProfile?.displayName || 'Unknown User'}</span>{' '}
          {message}
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>

      {!notification.isRead && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAsRead}
          disabled={isPending}
          className="flex-shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Mark as read'
          )}
        </Button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useGetCallerNotifications();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        toast.success('All notifications marked as read');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to mark all as read');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="gap-2"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
