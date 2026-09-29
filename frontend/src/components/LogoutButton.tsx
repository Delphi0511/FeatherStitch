import { useNavigate } from "react-router-dom";
import { clearSession } from "../auth";

// Top-right sign-out button: clears the saved session and returns to the login page.
const LogoutButton = () => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        clearSession();
        navigate("/login", { replace: true });
      }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-red-500/70 hover:text-red-300 hover:bg-red-500/10 text-sm font-semibold transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
      </svg>
      Log out
    </button>
  );
};

export default LogoutButton;
