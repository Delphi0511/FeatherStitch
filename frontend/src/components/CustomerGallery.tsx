import { useNavigate } from "react-router-dom";

// The customer's gallery of designs they have ordered. Orders don't exist yet,
// so for now it explains that and points the customer to Find Tailor.
const CustomerGallery = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 50%, #0f2040 100%)" }}
    >
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800">
        <button
          type="button"
          onClick={() => navigate("/customerdashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FeatherStitch</span>
        </div>
      </nav>

      <div className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-10">
        <div className="mb-8">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">My Collection</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gallery</h1>
          <p className="text-slate-400 text-sm mt-1">All the designs you have ordered from tailors.</p>
        </div>

        <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
          <div className="text-4xl mb-3">🖼️</div>
          <h2 className="text-white font-bold text-lg mb-1">No ordered designs yet</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            When you order a design from a tailor, it will appear here. Start by browsing tailors and their work.
          </p>
          <button
            type="button"
            onClick={() => navigate("/findtailor")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-900/30 transition-all"
          >
            Find a tailor →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerGallery;
