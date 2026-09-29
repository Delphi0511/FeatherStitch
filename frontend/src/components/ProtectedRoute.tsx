import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { clearSession, dashboardFor, getSession } from "../auth";
import type { Role, Session } from "../auth";
import AuthCard, { authButtonClass } from "./AuthCard";

interface Props {
  children: React.ReactNode;
  allowedRole: Role;
}

// Blocks signed-out (or expired) visitors, and sends a signed-in user of the other role to their own dashboard.
const ProtectedRoute = ({ children, allowedRole }: Props) => {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.usertype !== allowedRole) {
    return <Navigate to={dashboardFor(session.usertype)} replace />;
  }

  return <>{children}</>;
};

// Shown on /login, /signup and /forgot-password when someone is already signed in.
function AlreadySignedIn({ session, onLogout }: { session: Session; onLogout: () => void }) {
  return (
    <AuthCard eyebrow="Already signed in" title="You're already logged in" subtitle="You don't need to sign in again on this browser.">
      <div role="alert" className="mb-6 px-4 py-3 rounded-xl text-sm bg-amber-900/30 border border-amber-500/40 text-amber-200">
        ⚠️ You're signed in as <strong>{session.email}</strong> ({session.usertype}). Log out first if you want to use a different account.
      </div>
      <div className="space-y-3">
        <Link to={dashboardFor(session.usertype)} className={`block text-center ${authButtonClass}`}>
          Go to my dashboard →
        </Link>
        <button
          type="button"
          onClick={() => {
            clearSession();
            onLogout();
          }}
          className="w-full py-3.5 rounded-xl border border-slate-600 text-slate-300 hover:border-red-500/70 hover:text-red-300 text-sm font-bold transition-colors"
        >
          Log out and use another account
        </button>
      </div>
    </AuthCard>
  );
}

// Wraps the signed-out pages: a signed-in user sees a message instead of the form.
export const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState(getSession);
  return session ? <AlreadySignedIn session={session} onLogout={() => setSession(null)} /> : <>{children}</>;
};

export default ProtectedRoute;
