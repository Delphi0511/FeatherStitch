import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// Centered card layout shared by the forgot/reset password pages, matching the login styling.
const AuthCard = ({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: ReactNode }) => (
  <div
    className="min-h-screen flex items-center justify-center px-6 py-12"
    style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 60%, #0f2040 100%)" }}
  >
    <div className="w-full max-w-sm">
      <Link to="/" className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base">🧵</div>
        <span className="text-white font-bold text-lg">FeatherStitch</span>
      </Link>
      <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full mb-5" />
      <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">{eyebrow}</p>
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">{title}</h1>
      <p className="text-slate-400 text-sm mb-8">{subtitle}</p>
      {children}
    </div>
  </div>
);

export const authInputClass =
  "w-full bg-slate-800/60 border border-slate-600/80 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200";

export const authButtonClass =
  "w-full py-3.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-cyan-900/40";

export default AuthCard;
