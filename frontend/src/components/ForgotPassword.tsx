import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthCard, { authButtonClass, authInputClass } from "./AuthCard";
import { API_URL } from "../config";

// Asks for an email and requests a reset link; the server's reply never reveals whether the account exists.
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not send the reset link");
      setSentMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset link");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthCard eyebrow="Account help" title="Forgot password" subtitle="Enter your account email and we'll send you a link to choose a new password.">
      {sentMessage ? (
        <div className="space-y-6">
          <div className="px-4 py-3 rounded-xl text-sm bg-cyan-900/30 border border-cyan-500/30 text-cyan-300">
            ✉️ {sentMessage} The link expires in 1 hour. Check your spam folder if it doesn't arrive.
          </div>
          <Link to="/login" className="block text-center text-cyan-400 hover:text-cyan-300 text-sm font-bold">
            ← Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              className={authInputClass}
            />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-center bg-red-900/30 border border-red-500/30 text-red-400">⚠️ {error}</div>
          )}
          <button type="submit" disabled={sending} className={authButtonClass}>
            {sending ? "Sending…" : "Send reset link →"}
          </button>
          <p className="text-center text-slate-500 text-sm">
            Remembered it?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
