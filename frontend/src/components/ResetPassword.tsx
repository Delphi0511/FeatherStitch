import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { clearSession } from "../auth";
import AuthCard, { authButtonClass, authInputClass } from "./AuthCard";
import { API_URL } from "../config";

const MIN_PASSWORD_LENGTH = 6;

// Opened from the emailed link (?token=...): sets a new password for that account.
const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not reset the password");
      // Any session saved in this browser belongs to the old password; start fresh.
      clearSession();
      setDone(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password");
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <AuthCard eyebrow="Account help" title="Link not valid" subtitle="This page needs the link from your reset email.">
        <Link to="/forgot-password" className="block text-center text-cyan-400 hover:text-cyan-300 text-sm font-bold">
          Request a new reset link →
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard eyebrow="Account help" title="Choose a new password" subtitle={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
      {done ? (
        <div className="space-y-6">
          <div className="px-4 py-3 rounded-xl text-sm bg-emerald-900/30 border border-emerald-500/30 text-emerald-300">✓ {done}</div>
          <Link to="/login" className={`block text-center ${authButtonClass}`}>
            Go to login →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              New password
            </label>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={authInputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="accent-cyan-500" />
            Show passwords
          </label>
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-center bg-red-900/30 border border-red-500/30 text-red-400">
              ⚠️ {error}
              {error.includes("expired") || error.includes("invalid") ? (
                <Link to="/forgot-password" className="block mt-1 underline font-semibold">Request a new link</Link>
              ) : null}
            </div>
          )}
          <button type="submit" disabled={saving} className={authButtonClass}>
            {saving ? "Saving…" : "Update password →"}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
