import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    usertype: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.email || !formData.password || !formData.usertype) {
      setIsError(true);
      setMessage("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) setRedirect(true);
    } catch (error) {
      alert(error);
      setIsError(true);
      setMessage("Server error. Please try again.");
    }
  };

  // 🔥 humne yahan navigate kiya because hum chahte the ke urk bhi vhnage conditional rendering krte time url chnage ni ho paata sirf component chnage hota hai
  if (redirect && formData.usertype === "Tailor") return <Navigate to="/tailordashboard" />;
  if (redirect && formData.usertype === "Customer") return <Navigate to="/customerdashboard" />;

  // 🔥 NORMAL SIGNUP FORM RENDER

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
        {/* Right fade to dark */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />

        {/* Logo top-left on image */}
        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TailorPro</span>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-10 left-10 z-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-2">
            Your Style,<br />Our Craft.
          </h2>
          <p className="text-slate-300 text-sm">Connect with professional tailors near you.</p>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto flex justify-center relative">

        {/* Glow blobs */}
        <div className="absolute -top-20 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm px-8 py-10 relative z-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base">🧵</div>
            <span className="text-white font-bold text-lg">TailorPro</span>
          </div>

          {/* Cyan top line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full mb-5" />

          {/* Heading */}
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">Get Started</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">Create Account</h2>
          <p className="text-slate-400 text-sm mb-8">Sign up to access your dashboard</p>

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
                className="w-full bg-slate-800/60 border border-slate-600/80 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
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
              <p className="text-slate-600 text-xs mt-1.5">Minimum 6 characters</p>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, usertype: "Customer" }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                    formData.usertype === "Customer"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-600/80 bg-slate-800/40 hover:border-slate-500"
                  }`}
                >
                  <div className="text-xl mb-1.5">👤</div>
                  <p className={`text-sm font-bold ${formData.usertype === "Customer" ? "text-cyan-400" : "text-slate-300"}`}>
                    Customer
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">Find tailors and get custom clothing</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, usertype: "Tailor" }))}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                    formData.usertype === "Tailor"
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-slate-600/80 bg-slate-800/40 hover:border-slate-500"
                  }`}
                >
                  <div className="text-xl mb-1.5">✂️</div>
                  <p className={`text-sm font-bold ${formData.usertype === "Tailor" ? "text-cyan-400" : "text-slate-300"}`}>
                    Tailor
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">Offer services and manage orders</p>
                </button>
              </div>

              {/* Hidden select — keeps backend compatibility */}
              <select name="usertype" value={formData.usertype} onChange={handleChange} className="hidden">
                <option value="">Select User Type</option>
                <option value="Customer">Customer</option>
                <option value="Tailor">Tailor</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-cyan-900/40"
            >
              Create Account →
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-5 px-4 py-3 rounded-xl text-sm font-medium text-center ${
              isError
                ? "bg-red-900/30 border border-red-500/30 text-red-400"
                : "bg-cyan-900/30 border border-cyan-500/30 text-cyan-400"
            }`}>
              {isError ? "⚠️" : "✓"} {message}
            </div>
          )}

          {/* Login link */}
          <p className="text-center text-slate-500 text-xs mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;