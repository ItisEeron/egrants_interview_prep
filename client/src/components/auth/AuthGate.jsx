import { useAuth } from '../../context/AuthContext.jsx';
import { LoadingMessage } from '../common/StatusMessage.jsx';
import { SignInPage } from './SignInPage.jsx';

/**
 * Stands between the app and its progress: nothing below this renders until we
 * know who the progress belongs to.
 *
 * In local mode (`isEnabled` false) there is no account to wait for, so this
 * gets out of the way entirely.
 */
export function AuthGate({ children }) {
  const { isEnabled, user, isLoading } = useAuth();

  if (!isEnabled) return children;
  if (isLoading) return <LoadingMessage>Checking your session…</LoadingMessage>;
  if (!user) return <SignInPage />;

  return children;
}
