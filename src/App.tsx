import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AuthPage } from './features/auth/pages/AuthPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { usePushNotifications } from './features/notifications/hooks/usePushNotifications';
import { OnboardingPage } from './features/onboarding/pages/OnboardingPage';
import { useAuthSession } from './hooks/useAuthSession';

function getDefaultRoute(status: string) {
  if (status === 'draft' || status === 'needs_resubmission' || status === 'rejected') {
    return '/onboarding';
  }

  return '/dashboard';
}

function AppRoutes() {
  const { authUser, riderSession, isLoading, error, signOutCurrentUser } = useAuthSession();
  const { notification } = usePushNotifications(authUser);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <LoadingScreen label={error} />;
  }

  if (!authUser || !riderSession) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  const defaultRoute = getDefaultRoute(riderSession.rider.verificationStatus);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />
      <Route path="/onboarding" element={<OnboardingPage session={riderSession} />} />
      <Route
        path="/dashboard"
        element={<DashboardPage session={riderSession} onSignOut={signOutCurrentUser} notification={notification} />}
      />
      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
