import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { listTailors } from "../api/public.tsx";
import { thumbUrl } from "../api/posts.tsx";
import type { PublicTailor } from "../api/public.tsx";

// Shows a tailor's photo, or their initial when they haven't uploaded one.
export function TailorAvatar({ tailor, size = "w-14 h-14 text-xl" }: { tailor: PublicTailor; size?: string }) {
  return tailor.profilePic ? (
    <img src={tailor.profilePic} alt={tailor.name || "Tailor"} className={`${size} rounded-full object-cover border-2 border-violet-500/40`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold`}>
      {(tailor.name || "T").charAt(0).toUpperCase()}
    </div>
  );
}

// Lets a customer browse all tailors, search by name/speciality and city, and preview their designs.
const FindTailor = () => {
  const navigate = useNavigate();

  const [tailors, setTailors] = useState<PublicTailor[]>([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Fetches tailors for the given filters and stores the result or the error.
  const load = (filters: { q?: string; city?: string }) =>
    listTailors(filters)
      .then((result) => {
        setTailors(result);
        setError("");
      })
      .catch((err: Error) => setError(err.message || "Could not load tailors."))
      .finally(() => setLoading(false));

  useEffect(() => {
    void load({});
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(Boolean(q.trim() || city.trim()));
    void load({ q, city });
  };

  const clearSearch = () => {
    setQ("");
    setCity("");
    setSearched(false);
    setLoading(true);
    void load({});
  };

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
        {/* Header */}
        <div className="mb-8">
          <p className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Discover</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Find a Tailor</h1>
          <p className="text-slate-400 text-sm mt-1">Browse tailors and their designs, then open a tailor to see all their work.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or speciality (e.g. sherwani, bridal)"
            className="flex-1 bg-slate-800/60 border border-slate-600/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="sm:w-48 bg-slate-800/60 border border-slate-600/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 text-white text-sm font-bold shadow-lg shadow-violet-900/40 transition-all"
          >
            Search
          </button>
        </form>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm bg-red-900/30 border border-red-500/30 text-red-400">⚠️ {error}</div>
        )}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading tailors…</p>
        ) : tailors.length === 0 ? (
          !error && (
            <div className="text-center border border-dashed border-slate-700 rounded-2xl py-16 px-6">
              <div className="text-4xl mb-3">🔍</div>
              <h2 className="text-white font-bold text-lg mb-1">
                {searched ? "No tailors match your search" : "No tailors yet"}
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                {searched ? "Try a different name, speciality or city." : "Check back soon as tailors join FeatherStitch."}
              </p>
              {searched && (
                <button type="button" onClick={clearSearch} className="text-violet-300 hover:text-violet-200 text-sm font-semibold">
                  Show all tailors
                </button>
              )}
            </div>
          )
        ) : (
          <>
            <p className="text-slate-500 text-xs mb-4">
              {tailors.length} {tailors.length === 1 ? "tailor" : "tailors"}
              {searched && (
                <button type="button" onClick={clearSearch} className="ml-3 text-violet-300 hover:text-violet-200">
                  Clear search
                </button>
              )}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {tailors.map((tailor) => {
                const location = tailor.shopCity || tailor.city;
                return (
                  <button
                    key={tailor._id}
                    type="button"
                    onClick={() => navigate(`/tailors/${tailor._id}`)}
                    className="group flex flex-col text-left rounded-2xl border border-slate-700/60 bg-slate-800/40 hover:border-violet-500/60 hover:-translate-y-0.5 transition-all p-5"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <TailorAvatar tailor={tailor} />
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-lg truncate group-hover:text-violet-300 transition-colors">
                          {tailor.name || "Unnamed tailor"}
                        </h3>
                        <p className="text-slate-400 text-xs truncate">
                          {[tailor.speciality, tailor.category].filter(Boolean).join(" · ") || "Tailor"}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {[location && `📍 ${location}`, tailor.since && `Since ${tailor.since}`].filter(Boolean).join("   ")}
                        </p>
                      </div>
                    </div>

                    {/* Design previews */}
                    {tailor.previews && tailor.previews.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {tailor.previews.map((p) => (
                          <div key={p._id} className="aspect-square rounded-lg overflow-hidden bg-slate-900">
                            {p.image ? (
                              <img src={thumbUrl(p.image, 300)} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🧵</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-700 py-6 text-center text-slate-500 text-xs mb-3">
                        No designs posted yet
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {tailor.postCount} {tailor.postCount === 1 ? "design" : "designs"}
                      </span>
                      <span className="font-semibold text-slate-500 group-hover:text-violet-300 transition-colors">
                        View profile →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FindTailor;
