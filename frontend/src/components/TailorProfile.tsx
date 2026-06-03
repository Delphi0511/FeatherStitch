import { useState, useRef } from "react";

const CITIES: string[] = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur",
];

type Tab = "personal" | "professional" | "contact";

interface FormState {
  name: string; dob: string; gender: string; aadharNo: string;
  category: string; speciality: string; workType: string; website: string; since: string; otherInfo: string;
  email: string; phone: string; address: string; city: string; state: string; shopAddress: string; shopCity: string;
}

const ProfileTailor = () => {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [form, setForm] = useState<FormState>({
    name: "", dob: "", gender: "", aadharNo: "",
    category: "", speciality: "", workType: "", website: "", since: "", otherInfo: "",
    email: "", phone: "", address: "", city: "", state: "", shopAddress: "", shopCity: "",
  });

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [aadharName, setAadharName] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [shopCitySuggestions, setShopCitySuggestions] = useState<string[]>([]);

  const profileRef = useRef<HTMLInputElement>(null);
  const aadharRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setSaved(false);
    if (name === "city") setCitySuggestions(value ? CITIES.filter(c => c.toLowerCase().startsWith(value.toLowerCase())) : []);
    if (name === "shopCity") setShopCitySuggestions(value ? CITIES.filter(c => c.toLowerCase().startsWith(value.toLowerCase())) : []);
  };

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { if (profilePic) URL.revokeObjectURL(profilePic); setProfilePic(URL.createObjectURL(file)); }
  };

  const handleAadhar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAadharName(file.name);
      if (file.type.startsWith("image/")) setAadharPreview(URL.createObjectURL(file));
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "personal", label: "Personal", icon: "👤" },
    { key: "professional", label: "Professional", icon: "🧵" },
    { key: "contact", label: "Contact", icon: "📞" },
  ];
  const tabOrder: Tab[] = ["personal", "professional", "contact"];

  const inputClass = "w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200";
  const labelClass = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-widest";
  const selectClass = "w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">

        {/* Header */}
        <div className="relative px-10 py-7 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)" }}>
          {/* Glowing accent */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-lg shadow-lg">
              🧵
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Tailor Profile</h1>
              <p className="text-slate-400 text-xs mt-0.5">Complete your professional tailor profile</p>
            </div>
          </div>
        </div>

        {/* Email Search Bar */}
        <div className="bg-slate-800/50 border-b border-slate-700 px-10 py-4 flex gap-3 items-center">
          <input
            type="email"
            placeholder="Search by email to load existing profile..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200"
          />
          <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap shadow-md shadow-cyan-900/30">
            Find Record
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900 px-10">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                activeTab === tab.key
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-cyan-500 text-slate-900"
                  : "bg-slate-700 text-slate-400"
              }`}>
                {i + 1}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-10 py-8">

          {/* ── PERSONAL TAB ── */}
          {activeTab === "personal" && (
            <div>
              <div className="flex gap-8 mb-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-32 h-32 rounded-full border-2 border-slate-600 bg-slate-800 overflow-hidden flex items-center justify-center shadow-inner ring-2 ring-cyan-500/20">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-16 h-16 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                      </svg>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={profileRef} onChange={handleProfilePic} className="hidden" />
                  <button
                    onClick={() => profileRef.current?.click()}
                    className="px-5 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-all duration-200"
                  >
                    Browse Photo
                  </button>
                </div>

                {/* Name + DOB + Gender */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Enter full name" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Date of Birth <span className="text-red-400">*</span></label>
                      <input name="dob" value={form.dob} onChange={handleChange} type="date" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Gender <span className="text-red-400">*</span></label>
                      <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aadhar Section */}
              <div className="border border-dashed border-slate-600 rounded-xl p-5 bg-slate-800/40">
                <h3 className="text-sm font-bold text-cyan-400 mb-1">Aadhar Verification</h3>
                <p className="text-xs text-slate-500 mb-4">Upload your Aadhar card image for verification</p>
                <input type="file" accept="image/*,application/pdf" ref={aadharRef} onChange={handleAadhar} className="hidden" />
                <button
                  onClick={() => aadharRef.current?.click()}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-semibold rounded-lg transition-all duration-200 mb-3 shadow-md"
                >
                  Upload Aadhar Image
                </button>
                {aadharPreview && (
                  <div className="mb-3">
                    <img src={aadharPreview} alt="Aadhar" className="h-24 rounded-lg border border-slate-600 object-contain" />
                  </div>
                )}
                {aadharName && !aadharPreview && (
                  <p className="text-xs text-slate-400 mb-3">📎 {aadharName}</p>
                )}
                <div>
                  <label className={labelClass}>Aadhar Number</label>
                  <input name="aadharNo" value={form.aadharNo} onChange={handleChange}
                    placeholder="1234 5678 9012" className={inputClass} maxLength={14} />
                </div>
              </div>
            </div>
          )}

          {/* ── PROFESSIONAL TAB ── */}
          {activeTab === "professional" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className={selectClass}>
                    <option value="">Select</option>
                    <option>Men</option>
                    <option>Women</option>
                    <option>Children</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Speciality</label>
                  <input name="speciality" value={form.speciality} onChange={handleChange}
                    placeholder="e.g. Blouse, Suit, Lehenga..." className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Work Type</label>
                  <select name="workType" value={form.workType} onChange={handleChange} className={selectClass}>
                    <option value="">Select</option>
                    <option>Home</option>
                    <option>Shop</option>
                    <option>Both</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Since (Year)</label>
                  <input name="since" value={form.since} onChange={handleChange}
                    placeholder="e.g. 2010" type="number" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Website / Instagram / Facebook</label>
                <input name="website" value={form.website} onChange={handleChange}
                  placeholder="Link or social handle" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Other Information</label>
                <textarea name="otherInfo" value={form.otherInfo} onChange={handleChange}
                  placeholder="Timings, specializations, extra details..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-y"
                />
              </div>
            </div>
          )}

          {/* ── CONTACT TAB ── */}
          {activeTab === "contact" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Email <span className="text-red-400">*</span></label>
                  <input name="email" value={form.email} onChange={handleChange}
                    placeholder="email@example.com" type="email" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="Phone number" type="tel" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Address</label>
                <input name="address" value={form.address} onChange={handleChange}
                  placeholder="Street address" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="relative">
                  <label className={labelClass}>City</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="City" className={inputClass} autoComplete="off"
                    onBlur={() => setTimeout(() => setCitySuggestions([]), 150)} />
                  {citySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg z-10 shadow-xl max-h-36 overflow-y-auto">
                      {citySuggestions.map(c => (
                        <div key={c}
                          onMouseDown={() => { setForm({ ...form, city: c }); setCitySuggestions([]); }}
                          className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer border-b border-slate-700">
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <select name="state" value={form.state} onChange={handleChange} className={selectClass}>
                    <option value="">Select state</option>
                    <option>Andhra Pradesh</option>
                    <option>Delhi</option>
                    <option>Gujarat</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Punjab</option>
                    <option>Rajasthan</option>
                    <option>Tamil Nadu</option>
                    <option>Uttar Pradesh</option>
                    <option>West Bengal</option>
                  </select>
                </div>
              </div>

              {/* Shop section */}
              <div className="border-t border-slate-700 pt-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">If Shop</p>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Shop Address</label>
                    <input name="shopAddress" value={form.shopAddress} onChange={handleChange}
                      placeholder="Shop street address" className={inputClass} />
                  </div>
                  <div className="relative">
                    <label className={labelClass}>Shop City</label>
                    <input name="shopCity" value={form.shopCity} onChange={handleChange}
                      placeholder="Shop city" className={inputClass} autoComplete="off"
                      onBlur={() => setTimeout(() => setShopCitySuggestions([]), 150)} />
                    {shopCitySuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg z-10 shadow-xl max-h-36 overflow-y-auto">
                        {shopCitySuggestions.map(c => (
                          <div key={c}
                            onMouseDown={() => { setForm({ ...form, shopCity: c }); setShopCitySuggestions([]); }}
                            className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer border-b border-slate-700">
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="mt-6 px-4 py-3 bg-cyan-900/30 border border-cyan-600/40 text-cyan-400 text-sm font-medium rounded-lg text-center">
              ✓ Profile saved successfully!
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => { const idx = tabOrder.indexOf(activeTab); if (idx > 0) setActiveTab(tabOrder[idx - 1]); }}
              className={`px-6 py-2.5 border border-slate-600 text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 ${activeTab === "personal" ? "invisible" : ""}`}
            >
              ← Previous
            </button>

            {activeTab !== "contact" ? (
              <button
                onClick={() => { const idx = tabOrder.indexOf(activeTab); setActiveTab(tabOrder[idx + 1]); }}
                className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-cyan-900/40"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setSaved(true)}
                className="px-10 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-cyan-900/40"
              >
                Save Profile
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileTailor;
