import { useNavigate } from "react-router-dom";

// Shown for any URL without a page (including features not built yet) instead of a blank screen.
const NotFound = () => {
  const navigate = useNavigate();

  // Sends the user back to their own dashboard, or to login if nobody is signed in.
  const goHome = () => {
    let usertype = "";
    try {
      usertype = JSON.parse(localStorage.getItem("user") || "{}").usertype || "";
    } catch {
      // Unreadable session data: fall through to login.
    }
    if (usertype === "Tailor") navigate("/tailordashboard");
    else if (usertype === "Customer") navigate("/customerdashboard");
    else navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 50%, #0f2040 100%)" }}
    >
      <div className="text-5xl mb-4">🧵</div>
      <h1 className="text-2xl font-extrabold text-white mb-2">This page isn't ready yet</h1>
      <p className="text-slate-400 text-sm mb-6 max-w-sm">
        It may be a feature we're still building, or the link may be wrong.
      </p>
      <button
        type="button"
        onClick={goHome}
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-bold"
      >
        ← Back to dashboard
      </button>
    </div>
  );
};

export default NotFound;
