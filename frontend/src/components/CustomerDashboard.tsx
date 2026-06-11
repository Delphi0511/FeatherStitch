import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const cards = [
    {
      title: "Profile",
      description: "View and manage your personal details",
      icon: "👤",
      gradient: "from-cyan-600 to-sky-700",
      glow: "shadow-cyan-900/50",
      ring: "ring-cyan-500/30",
      route: "/customerprofile",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    },
    {
      title: "Find Tailor",
      description: "Search professional tailors near you",
      icon: "🔍",
      gradient: "from-violet-600 to-purple-700",
      glow: "shadow-violet-900/50",
      ring: "ring-violet-500/30",
      route: "/findtailor",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    },
    {
      title: "Measurements",
      description: "Add or update your body measurements",
      icon: "📏",
      gradient: "from-pink-600 to-rose-700",
      glow: "shadow-pink-900/50",
      ring: "ring-pink-500/30",
      route: "/measurements",
      img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
    },
    {
      title: "My Orders",
      description: "Track your current and past orders",
      icon: "📦",
      gradient: "from-emerald-600 to-green-700",
      glow: "shadow-emerald-900/50",
      ring: "ring-emerald-500/30",
      route: "/orders",
      img: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80",
    },
    {
      title: "Gallery",
      description: "Browse tailor portfolios and get inspired",
      icon: "🖼️",
      gradient: "from-amber-600 to-orange-700",
      glow: "shadow-amber-900/50",
      ring: "ring-amber-500/30",
      route: "/gallery",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
    },
    {
      title: "Logout",
      description: "Sign out safely from your account",
      icon: "🚪",
      gradient: "from-red-700 to-red-900",
      glow: "shadow-red-900/50",
      ring: "ring-red-500/30",
      route: "/logout",
      img: null,
      logout: true,
    },
  ];

  const stats = [
    { label: "Active Orders", value: "3", icon: "📦", color: "text-cyan-400" },
    { label: "Tailors Found", value: "12", icon: "🔍", color: "text-violet-400" },
    { label: "Measurements", value: "Saved", icon: "📏", color: "text-pink-400" },
    { label: "Gallery Views", value: "58", icon: "🖼️", color: "text-amber-400" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 50%, #0f2040 100%)" }}
    >
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-12 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TailorPro</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            C
          </div>
          <span className="text-slate-400 text-sm">Welcome back!</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative px-12 pt-14 pb-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500/40 via-sky-400/20 to-transparent" />
        <div className="relative z-10">
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">Dashboard</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
            Customer Dashboard
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            Find tailors, track orders, manage your measurements — everything you need in one place.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 px-12 pb-14">
        <div className="grid grid-cols-3 gap-6">
          {cards.map((card) => (
            <button
              key={card.title}
              onClick={() => navigate(card.route)}
              className={`group relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-800/40 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${card.glow} ring-1 ${card.ring} text-left`}
            >
              {/* Image or Gradient */}
              {card.img ? (
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.gradient} opacity-60`} />
                  <div className="absolute top-4 left-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-xl shadow-lg`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`h-44 bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <div className="text-5xl opacity-80">{card.icon}</div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5">
                <h3 className="text-white font-bold text-base mb-1 group-hover:text-cyan-300 transition-colors duration-200">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">{card.description}</p>
                <div className="mt-4 text-xs font-semibold text-slate-500 group-hover:text-cyan-400 transition-colors duration-200">
                  {card.logout ? <span className="text-red-400">Sign out →</span> : <span>Open →</span>}
                </div>
              </div>

              {/* Bottom slide accent */}
              <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${card.gradient} group-hover:w-full transition-all duration-500`} />
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/40 border border-slate-700/60 rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;