import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type Gender = "male" | "female";
type MaleTabId = "upper" | "lower";
type FemaleTabId = "upper" | "lower" | "trad";

interface FieldValue {
  value: string;
  unit: string;
}

type FieldMap = Record<string, FieldValue>;

interface MaleData {
  upper: FieldMap;
  lower: FieldMap;
}

interface FemaleData {
  upper: FieldMap;
  lower: FieldMap;
  trad: FieldMap;
}

interface TabConfig {
  id: string;
  icon: string;
  label: string;
  sub: string;
  sectionTitle: string;
  fields: string[];
  isTraditional?: boolean;
}

interface MeasurementFieldProps {
  label: string;
  value: string;
  unit: string;
  units?: string[];
  onChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
}

// ── Data ───────────────────────────────────────────────────────────────────
const MALE_TABS: TabConfig[] = [
  {
    id: "upper",
    icon: "👕",
    label: "Upper Body",
    sub: "Shirts · Kurtas · Blazers",
    sectionTitle: "SHIRTS / KURTAS / BLAZERS",
    fields: [
      "CHEST", "WAIST", "SHOULDER WIDTH",
      "SLEEVE LENGTH", "ARMHOLE", "NECK",
      "SHIRT LENGTH", "BICEP", "WRIST",
    ],
  },
  {
    id: "lower",
    icon: "👖",
    label: "Lower Body",
    sub: "Pants · Trousers",
    sectionTitle: "PANTS / TROUSERS",
    fields: [
      "WAIST", "HIP", "THIGH",
      "KNEE", "CALF", "INSEAM",
      "OUTSEAM", "ANKLE OPENING",
    ],
  },
];

const FEMALE_TABS: TabConfig[] = [
  {
    id: "upper",
    icon: "👚",
    label: "Upper Body",
    sub: "Blouse · Tops · Kurtis",
    sectionTitle: "BLOUSE / TOPS / KURTIS",
    fields: [
      "BUST", "UNDERBUST", "WAIST",
      "SHOULDER", "SLEEVE LENGTH", "ARMHOLE",
      "NECK DEPTH (FRONT)", "NECK DEPTH (BACK)", "TOP LENGTH",
      "APEX (BUST POINT)",
    ],
  },
  {
    id: "lower",
    icon: "👗",
    label: "Lower Body",
    sub: "Skirts · Pants · Suits",
    sectionTitle: "SKIRTS / PANTS / SUITS",
    fields: [
      "WAIST", "HIP", "THIGH",
      "KNEE", "CALF", "LENGTH",
    ],
  },
  {
    id: "trad",
    icon: "🥻",
    label: "Traditional",
    sub: "Ethnic · Lehenga · Saree",
    sectionTitle: "INDIAN ETHNIC WEAR",
    fields: [],
    isTraditional: true,
  },
];

const BLOUSE_STYLES = [
  "Select style", "Round Back", "Deep Back",
  "Backless", "Bow Back", "Tie Back",
];

const TRAD_FIELDS: { key: string; units: string[] }[] = [
  { key: "KURTI LENGTH",   units: ["cm", "in"] },
  { key: "SALWAR LENGTH",  units: ["cm", "in"] },
  { key: "LEHENGA LENGTH", units: ["cm", "in"] },
  { key: "LEHENGA WAIST",  units: ["cm", "in"] },
  { key: "LEHENGA FLARE",  units: ["m", "cm"] },
  { key: "DUPATTA LENGTH", units: ["m", "cm"] },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const initFields = (fields: string[]): FieldMap =>
  Object.fromEntries(fields.map((f) => [f, { value: "", unit: "cm" }]));

const initTraditional = (): FieldMap => ({
  "KURTI LENGTH":      { value: "", unit: "cm" },
  "SALWAR LENGTH":     { value: "", unit: "cm" },
  "LEHENGA LENGTH":    { value: "", unit: "cm" },
  "LEHENGA WAIST":     { value: "", unit: "cm" },
  "LEHENGA FLARE":     { value: "", unit: "m" },
  "DUPATTA LENGTH":    { value: "", unit: "m" },
  "BLOUSE BACK STYLE": { value: "Select style", unit: "" },
});

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type, visible }: { message: string; type: "success" | "error" | "loading"; visible: boolean }) {
  if (!visible) return null;
  const config = {
    success: { icon: "✓", wrap: "bg-emerald-950 border-emerald-500/60", ic: "text-emerald-400" },
    error:   { icon: "✕", wrap: "bg-red-950 border-red-500/60",         ic: "text-red-400" },
    loading: { icon: "⟳", wrap: "bg-slate-900 border-cyan-500/60",       ic: "text-cyan-400 animate-spin inline-block" },
  }[type];

  return (
    <div className={`fixed top-5 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl min-w-[240px] ${config.wrap}`}>
      <span className={`text-base font-bold ${config.ic}`}>{config.icon}</span>
      <span className="text-slate-100 text-sm font-medium">{message}</span>
    </div>
  );
}

// ── MeasurementField ───────────────────────────────────────────────────────
function MeasurementField({ label, value, unit, units = ["cm", "in"], onChange, onUnitChange }: MeasurementFieldProps) {
  const base = "bg-[#0b1525] border border-[#1e3a5f] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500 transition-colors duration-200";

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[11px] font-bold tracking-[1.8px] text-cyan-400">{label}</div>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value)}
          className={`${base} w-20 h-12 px-3`}
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className={`${base} flex-1 h-12 px-3 cursor-pointer`}
        >
          {units.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function BodyMeasurements() {
  const [gender, setGender]         = useState<Gender>("male");
  const [maleTab, setMaleTab]       = useState<MaleTabId>("upper");
  const [femaleTab, setFemaleTab]   = useState<FemaleTabId>("upper");
  const [isSaving, setIsSaving]     = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "loading"; visible: boolean }>({
    message: "", type: "success", visible: false,
  });

  const [maleData, setMaleData] = useState<MaleData>(() => ({
    upper: initFields(MALE_TABS[0].fields),
    lower: initFields(MALE_TABS[1].fields),
  }));

  const [femaleData, setFemaleData] = useState<FemaleData>(() => ({
    upper: initFields(FEMALE_TABS[0].fields),
    lower: initFields(FEMALE_TABS[1].fields),
    trad:  initTraditional(),
  }));

  const showToast = (message: string, type: "success" | "error" | "loading") =>
    setToast({ message, type, visible: true });
  const hideToast = () => setToast((t) => ({ ...t, visible: false }));

  const handleMaleChange = (field: string, key: keyof FieldValue, val: string) =>
    setMaleData((prev) => ({
      ...prev,
      [maleTab]: { ...prev[maleTab], [field]: { ...prev[maleTab][field], [key]: val } },
    }));

  const handleFemaleChange = (field: string, key: keyof FieldValue, val: string) =>
    setFemaleData((prev) => ({
      ...prev,
      [femaleTab]: { ...prev[femaleTab], [field]: { ...prev[femaleTab][field], [key]: val } },
    }));

  const handleSave = async () => {
    setIsSaving(true);
    showToast("Saving measurements…", "loading");
    const snapshot = gender === "male"
      ? { gender, tab: maleTab, data: maleData[maleTab] }
      : { gender, tab: femaleTab, data: femaleData[femaleTab] };
    console.log("Saved:", JSON.stringify(snapshot, null, 2));
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    showToast("Measurements saved!", "success");
    setTimeout(hideToast, 3000);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    showToast("Updating measurements…", "loading");
    const snapshot = gender === "male"
      ? { gender, tab: maleTab, data: maleData[maleTab] }
      : { gender, tab: femaleTab, data: femaleData[femaleTab] };
    console.log("Updated:", JSON.stringify(snapshot, null, 2));
    await new Promise((r) => setTimeout(r, 800));
    setIsUpdating(false);
    showToast("Measurements updated!", "success");
    setTimeout(hideToast, 3000);
  };

  const tabs       = gender === "male" ? MALE_TABS : FEMALE_TABS;
  const curTabId   = gender === "male" ? maleTab : femaleTab;
  const activeTab  = tabs.find((t) => t.id === curTabId)!;
  const activeData = gender === "male" ? maleData[maleTab] : femaleData[femaleTab];
  const onChange   = gender === "male" ? handleMaleChange : handleFemaleChange;

  const darkSelect = "w-full bg-[#0b1525] border border-[#1e3a5f] rounded-lg text-slate-100 text-sm h-12 px-3 outline-none focus:border-cyan-500 cursor-pointer transition-colors duration-200";

  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen bg-[#060f1e] font-sans">

      <Toast {...toast} />

      {/* ── Sidebar ── */}
      <aside className="bg-[#0f1f3d] border-r border-[#1e3a5f] flex flex-col min-h-screen">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-[22px] border-b border-[#1e3a5f]">
          <div className="w-10 h-10 bg-cyan-500 rounded-[10px] flex items-center justify-center text-lg shrink-0">
            👤
          </div>
          <div>
            <div className="text-base font-bold text-slate-100 tracking-[0.3px]">Body Measurements</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Track customer measurements</div>
          </div>
        </div>

        {/* Gender */}
        <div className="px-4 pt-[18px] pb-2">
          <div className="text-[10px] font-bold tracking-[2px] text-slate-500 mb-2.5">GENDER</div>
          <div className="flex flex-col gap-2">
            {(["male", "female"] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px] font-semibold w-full text-left transition-all duration-200
                  ${gender === g
                    ? "border-cyan-500 bg-[#0d2a3e] text-slate-100"
                    : "border-[#1e3a5f] bg-transparent text-slate-500 hover:bg-[#0d1a30]"
                  }`}
              >
                {g === "male" ? "♂" : "♀"} {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Body Section Tabs */}
        <div className="px-4 pt-2 flex-1">
          <div className="text-[10px] font-bold tracking-[2px] text-slate-500 mb-2.5">BODY SECTION</div>
          {tabs.map((tab) => {
            const isActive = tab.id === curTabId;
            return (
              <div
                key={tab.id}
                onClick={() =>
                  gender === "male"
                    ? setMaleTab(tab.id as MaleTabId)
                    : setFemaleTab(tab.id as FemaleTabId)
                }
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] border cursor-pointer mb-2 transition-all duration-200
                  ${isActive
                    ? "border-cyan-500 bg-[#0d2a3e]"
                    : "border-[#1e3a5f] bg-[#0d1a30] hover:bg-[#0b1830]"
                  }`}
              >
                <span className="text-xl shrink-0">{tab.icon}</span>
                <div>
                  <span className={`block text-[11px] font-bold tracking-[1px] ${isActive ? "text-cyan-400" : "text-slate-500"}`}>
                    {tab.label.toUpperCase()}
                  </span>
                  <span className="block text-[10px] text-[#4a6a80] mt-0.5">{tab.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-col min-h-screen bg-[#060f1e]">

        {/* Top bar */}
        <div className="bg-[#0f1f3d] px-7 py-[18px] border-b border-[#1e3a5f] flex items-center justify-between shrink-0">
          <div>
            <div className="text-lg font-bold text-slate-100 tracking-[0.3px]">{activeTab.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{activeTab.sub}</div>
          </div>
          <div className="flex items-center gap-3">
            {(isSaving || isUpdating) && (
              <span className="text-[11px] text-cyan-400 tracking-[1px]">PROCESSING…</span>
            )}
            <div className="bg-[#0d2a3e] border border-cyan-500 rounded-md px-3 py-1 text-[11px] font-bold text-cyan-400 tracking-[1px]">
              {activeTab.sectionTitle}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 px-8 pt-7 pb-4 overflow-y-auto">
          <div className="text-[13px] font-bold tracking-[2px] text-cyan-500 border-b border-[#1e3a5f] pb-3.5 mb-7">
            {activeTab.sectionTitle}
          </div>

          {activeTab.isTraditional ? (
            <div className="grid grid-cols-3 gap-x-6 gap-y-7">
              {TRAD_FIELDS.map(({ key, units }) => (
                <MeasurementField
                  key={key}
                  label={key}
                  value={activeData[key]?.value ?? ""}
                  unit={activeData[key]?.unit ?? units[0]}
                  units={units}
                  onChange={(v) => onChange(key, "value", v)}
                  onUnitChange={(u) => onChange(key, "unit", u)}
                />
              ))}
              <div className="col-span-3 flex flex-col gap-2">
                <div className="text-[11px] font-bold tracking-[1.8px] text-cyan-400">BLOUSE BACK STYLE</div>
                <select
                  className={darkSelect}
                  value={activeData["BLOUSE BACK STYLE"]?.value ?? "Select style"}
                  onChange={(e) => onChange("BLOUSE BACK STYLE", "value", e.target.value)}
                >
                  {BLOUSE_STYLES.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-6 gap-y-7">
              {activeTab.fields.map((field) => (
                <MeasurementField
                  key={field}
                  label={field}
                  value={activeData[field]?.value ?? ""}
                  unit={activeData[field]?.unit ?? "cm"}
                  onChange={(v) => onChange(field, "value", v)}
                  onUnitChange={(u) => onChange(field, "unit", u)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sticky bottom buttons */}
        <div className="flex gap-3.5 px-7 py-4 bg-[#060f1e] border-t border-[#1e3a5f] shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-lg text-sm font-bold tracking-[0.5px] border border-cyan-500 text-cyan-400 bg-transparent hover:bg-[#0d2a3e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 py-3 rounded-lg text-sm font-bold tracking-[0.5px] bg-cyan-500 hover:bg-cyan-600 border border-cyan-500 text-[#001020] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isUpdating ? "Updating…" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
