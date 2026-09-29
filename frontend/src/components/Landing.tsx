import { Link } from "react-router-dom";
import { dashboardFor, getSession } from "../auth";

const HERO_IMAGE = "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=1200&q=80";

const STEPS = [
  { icon: "🔍", title: "Find a tailor", text: "Browse tailors near you and explore the designs they've made." },
  { icon: "📏", title: "Save your measurements", text: "Enter them once, in cm or inches, and reuse them for every order." },
  { icon: "🧾", title: "Order a design", text: "Pick a design, add notes, and share only the measurements you choose." },
  { icon: "✨", title: "Track it to your door", text: "Follow each step from accepted to delivered in My Orders." },
];

const CUSTOMER_POINTS = [
  "Discover tailors by city and speciality",
  "See real work before you order",
  "Measurements saved with their units",
  "Every order and its status in one place",
];

const TAILOR_POINTS = [
  "A portfolio of your designs with photos",
  "Orders arrive with the customer's measurements",
  "Accept, start, finish and deliver in a few clicks",
  "Keep track of every customer you've served",
];

// Public home page. Signed-in visitors get a shortcut to their dashboard instead of login/sign-up.
const Landing = () => {
  const session = getSession();
  const dashboard = session ? dashboardFor(session.usertype) : null;

  const primaryCta = session
    ? { to: dashboard!, label: "Go to my dashboard →" }
    : { to: "/signup", label: "Find a tailor →" };

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #060d1f 0%, #0d1b2e 55%, #0f2040 100%)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-slate-800/80">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-base shadow-lg shadow-cyan-900/40">
            🧵
          </div>
          <span className="font-bold text-lg tracking-tight">FeatherStitch</span>
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link to={dashboard!} className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-sm font-bold">
              My dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-lg text-slate-300 hover:text-white text-sm font-semibold">
                Log in
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-sm font-bold">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative z-10">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">Made to measure</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5">
              Clothes that fit you,
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">stitched by tailors near you.</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg mb-8 max-w-lg">
              FeatherStitch connects you with skilled local tailors. Browse their work, share your measurements and track your order until it's delivered.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={primaryCta.to} className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 font-bold text-sm shadow-lg shadow-cyan-900/40">
                {primaryCta.label}
              </Link>
              {!session && (
                <Link to="/signup?role=Tailor" className="px-6 py-3.5 rounded-xl border border-slate-600 hover:border-cyan-500 text-slate-200 hover:text-cyan-300 font-bold text-sm">
                  Join as a tailor
                </Link>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/20 to-sky-600/10 rounded-3xl blur-2xl" />
            <img
              src={HERO_IMAGE}
              alt="A tailor sewing a garment at a machine"
              className="relative w-full h-[420px] object-cover rounded-3xl border border-slate-700/60 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">How it works</p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-10">From measurements to your doorstep</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{step.icon}</span>
                <span className="text-slate-600 text-sm font-extrabold">0{i + 1}</span>
              </div>
              <h3 className="font-bold mb-1">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For customers / tailors */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-2 gap-6">
        {[
          { title: "For customers", accent: "text-violet-300", border: "border-violet-500/30", points: CUSTOMER_POINTS, icon: "👤" },
          { title: "For tailors", accent: "text-emerald-300", border: "border-emerald-500/30", points: TAILOR_POINTS, icon: "✂️" },
        ].map((col) => (
          <div key={col.title} className={`rounded-2xl border ${col.border} bg-slate-800/30 p-8`}>
            <div className="text-3xl mb-3">{col.icon}</div>
            <h3 className={`text-xl font-extrabold mb-5 ${col.accent}`}>{col.title}</h3>
            <ul className="space-y-3">
              {col.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-slate-300 text-sm">
                  <span className={`${col.accent} font-bold`}>✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Closing call to action */}
      {!session && (
        <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div className="rounded-3xl bg-gradient-to-r from-cyan-700/40 to-sky-700/30 border border-cyan-500/30 p-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Ready for a perfect fit?</h2>
            <p className="text-slate-300 mb-7">Create a free account in under a minute.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-cyan-50">
                Sign up as a customer
              </Link>
              <Link to="/signup?role=Tailor" className="px-6 py-3.5 rounded-xl border border-white/40 hover:border-white font-bold text-sm">
                Sign up as a tailor
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-800/80 px-6 md:px-12 py-8 text-center text-slate-500 text-xs">
        © {new Date().getFullYear()} FeatherStitch · Made-to-measure clothing from local tailors
      </footer>
    </div>
  );
};

export default Landing;
