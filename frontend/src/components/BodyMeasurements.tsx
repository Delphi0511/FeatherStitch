import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
// ── Types ──────────────────────────────────────────────────────────────────
type Gender = "male" | "female";
type MaleTabId = "upper" | "lower";
type FemaleTabId = "upper" | "lower" | "trad";

interface FieldValue {
  value: string;
  unit: string;
}

type FieldMap = Record<string, FieldValue>;

interface StoredMeasurement {
  gender: Gender;
  type: MaleTabId | FemaleTabId;
  units?: Record<string, string>;
  [key: string]: unknown;
}

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

// Maps form labels to normalized API fields so records can be loaded back into the UI.
const STORED_FIELD_KEYS: Record<string, string> = {
  "CHEST": "chest", "WAIST": "waist", "SHOULDER WIDTH": "shoulderWidth", "SHOULDER": "shoulderWidth", "SLEEVE LENGTH": "sleeveLength", "ARMHOLE": "armhole", "NECK": "neck", "SHIRT LENGTH": "shirtLength", "BICEP": "bicep", "WRIST": "wrist", "BUST": "bust", "UNDERBUST": "underbust", "APEX (BUST POINT)": "apex", "NECK DEPTH (FRONT)": "neckDepthFront", "NECK DEPTH (BACK)": "neckDepthBack", "TOP LENGTH": "topLength", "HIP": "hip", "THIGH": "thigh", "KNEE": "knee", "CALF": "calf", "INSEAM": "inseam", "OUTSEAM": "outseam", "LENGTH": "outseam", "ANKLE OPENING": "ankleOpening", "KURTI LENGTH": "kurtiLength", "SALWAR LENGTH": "salwarLength", "LEHENGA LENGTH": "lehengaLength", "LEHENGA WAIST": "lehengaWaist", "LEHENGA FLARE": "lehengaFlare", "DUPATTA LENGTH": "dupattaLength", "BLOUSE BACK STYLE": "blouseBackStyle",
};

// ── Helpers ────────────────────────────────────────────────────────────────
// Builds blank value/unit pairs so every measurement field starts in a consistent shape.
const initFields = (fields: string[]): FieldMap =>
  Object.fromEntries(fields.map((f) => [f, { value: "", unit: "cm" }]));

// Builds the special traditional-wear fields that include a style selection.
const initTraditional = (): FieldMap => ({
  "KURTI LENGTH":      { value: "", unit: "cm" },
  "SALWAR LENGTH":     { value: "", unit: "cm" },
  "LEHENGA LENGTH":    { value: "", unit: "cm" },
  "LEHENGA WAIST":     { value: "", unit: "cm" },
  "LEHENGA FLARE":     { value: "", unit: "m" },
  "DUPATTA LENGTH":    { value: "", unit: "m" },
  "BLOUSE BACK STYLE": { value: "Select style", unit: "" },
});

// Applies a saved record to a blank section while retaining the UI's unit defaults.
const hydrateFields = (fields: FieldMap, measurement: StoredMeasurement): FieldMap =>
  Object.fromEntries(Object.entries(fields).map(([label, field]) => {
    const key = STORED_FIELD_KEYS[label];
    const storedValue = measurement[key];
    const storedUnit = measurement.units?.[key];
    return [label, {
      value: storedValue == null ? field.value : String(storedValue),
      unit: storedUnit || field.unit,
    }];
  }));

// ── Toast ──────────────────────────────────────────────────────────────────
// Renders transient status feedback so saving actions are visible without interrupting the form.
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
// Renders one reusable measurement value/unit control to keep all garment sections consistent.
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
// Lets the authenticated customer enter and save measurements for each garment category.
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

  // Loads every saved section for the authenticated customer when the form opens.
  useEffect(() => {
    const loadMeasurements = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.userId) return;

        const response = await axios.get<StoredMeasurement[]>(
          `${API_URL}/api/measurements/${user.userId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
        );

        setMaleData((previous) => {
          const next = { ...previous };
          response.data.filter((item) => item.gender === "male").forEach((item) => {
            const type = item.type as MaleTabId;
            if (type in next) next[type] = hydrateFields(next[type], item);
          });
          return next;
        });
        setFemaleData((previous) => {
          const next = { ...previous };
          response.data.filter((item) => item.gender === "female").forEach((item) => {
            const type = item.type as FemaleTabId;
            if (type in next) next[type] = hydrateFields(next[type], item);
          });
          return next;
        });
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || "Unable to load saved measurements."
          : "Unable to load saved measurements.";
        setToast({ message, type: "error", visible: true });
      }
    };

    void loadMeasurements();
  }, []);

  // Displays a status message shared by save and update actions.
  const showToast = (message: string, type: "success" | "error" | "loading") =>
    setToast({ message, type, visible: true });
  // Hides the temporary status message after its display interval.
  const hideToast = () => setToast((t) => ({ ...t, visible: false }));

  // Updates one field in the currently selected male measurement section.
  const handleMaleChange = (field: string, key: keyof FieldValue, val: string) =>
    setMaleData((prev) => ({
      ...prev,
      [maleTab]: { ...prev[maleTab], [field]: { ...prev[maleTab][field], [key]: val } },
    }));

  // Updates one field in the currently selected female measurement section.
  const handleFemaleChange = (field: string, key: keyof FieldValue, val: string) =>
    setFemaleData((prev) => ({
      ...prev,
      [femaleTab]: { ...prev[femaleTab], [field]: { ...prev[femaleTab][field], [key]: val } },
    }));

  // Sends the active section (values + units) to the server's upsert endpoint and reports the real outcome.
  const persistSection = async (verb: "Saving" | "Updating", done: string) => {
    showToast(`${verb} measurements…`, "loading");
    try {
      await axios.post(
        `${API_URL}/api/measurements/save`,
        {
          gender,
          type: gender === "male" ? maleTab : femaleTab,
          data: gender === "male" ? maleData[maleTab] : femaleData[femaleTab],
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      );
      showToast(done, "success");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Could not save measurements."
        : "Could not save measurements.";
      showToast(message, "error");
    }
    setTimeout(hideToast, 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await persistSection("Saving", "Measurements saved!");
    setIsSaving(false);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    await persistSection("Updating", "Measurements updated!");
    setIsUpdating(false);
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
