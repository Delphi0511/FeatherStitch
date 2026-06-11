import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      localStorage.setItem(
  "token",
  data.token
);alert(data.token);
alert("Token saved");

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Optional: save token if backend sends it
      // localStorage.setItem("token", data.token);

      if (data.usertype == "Tailor") {
        navigate("/tailordashboard");
      } else if (data.usertype == "Customer") {
        navigate("/customerdashboard");
      } else {
        alert(error);
        setError("Unknown user type");
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 60%, #0f2040 100%)" }}
    >
      {/* ── LEFT: Full bleed image ── */}
      <div className="hidden lg:block w-1/2 relative h-full">
        <img
          src="https://images.unsplash.com/photo-1520975916090-3105956dac38"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        {/* Fades */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />

        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TailorPro</span>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-10 left-10 z-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-2">
            Welcome<br />Back.
          </h2>
          <p className="text-slate-300 text-sm">Sign in to manage your tailor experience.</p>

          {/* Feature dots */}
          <div className="flex flex-col gap-2 mt-5">
            {["Find expert tailors near you", "Track your orders in real-time", "Custom fits, guaranteed"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
                <span className="text-slate-300 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex justify-center relative">

        {/* Glow blobs */}
        <div className="absolute -top-20 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm px-8 py-16 relative z-10 flex flex-col justify-center min-h-full">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base">🧵</div>
            <span className="text-white font-bold text-lg">TailorPro</span>
          </div>

          {/* Cyan top line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full mb-5" />

          {/* Heading */}
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">Welcome Back</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">Login</h2>
          <p className="text-slate-400 text-sm mb-10">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/60 border border-slate-600/80 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/60 border border-slate-600/80 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-medium text-center bg-red-900/30 border border-red-500/30 text-red-400">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Signup link */}
          <p className="text-center text-slate-500 text-sm">
            New user?{" "}
            <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              Signup
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;