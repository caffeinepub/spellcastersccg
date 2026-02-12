import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import AppShell from './components/AppShell';
import AuthGate from './components/AuthGate';
import FeedPage from './pages/FeedPage';
import MyProfilePage from './pages/MyProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import UserDirectoryPage from './pages/UserDirectoryPage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

function IndexComponent() {
  return <FeedPage />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  component: () => (
    <AuthGate>
      <FeedPage />
    </AuthGate>
  ),
});

const myProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <AuthGate>
      <MyProfilePage />
    </AuthGate>
  ),
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user/$userId',
  component: () => (
    <AuthGate>
      <UserProfilePage />
    </AuthGate>
  ),
});

const directoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/directory',
  component: () => (
    <AuthGate>
      <UserDirectoryPage />
    </AuthGate>
  ),
});

const requestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/requests',
  component: () => (
    <AuthGate>
      <FriendRequestsPage />
    </AuthGate>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => (
    <AuthGate>
      <NotificationsPage />
    </AuthGate>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <AuthGate>
      <SettingsPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  feedRoute,
  myProfileRoute,
  userProfileRoute,
  directoryRoute,
  requestsRoute,
  notificationsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
