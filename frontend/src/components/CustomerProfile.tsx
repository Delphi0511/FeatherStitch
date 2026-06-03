import { useState, useRef } from "react";
import type { ChangeEvent } from "react";

interface FormState {
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  gender: string;
}

const CustomerProfile = () => {
  const [form, setForm] = useState<FormState>({
    email: "", name: "", address: "", city: "", state: "", gender: "",
  });
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [saved, setSaved] = useState<boolean>(false);
  const [updated, setUpdated] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setUpdated(false);
  };

  // Opens the hidden file input
  const handleBrowseClick = (): void => {
    fileRef.current?.click();
  };

  // Previews the selected file locally — does NOT upload yet
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    if (profilePic) URL.revokeObjectURL(profilePic);
    setProfilePic(URL.createObjectURL(selectedFile));
  };

  // Uploads pic to server — called inside saveCustomer
  const uploadProfilePic = async (): Promise<void> => {
    if (!file || !form.email) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", form.email);
    await fetch("http://localhost:5000/api/customer/upload-profile", {
      method: "POST",
      body: formData,
    });
  };
  const handleUpdate = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/customer/${form.email}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log(data);

    alert("Profile Updated Successfully");
  } catch (err) {
    console.error(err);
  }
};

  const searchCustomer = async (): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/api/customer/getCustomer/${form.email}`);
      const data = await response.json();
      if (data) {
        setForm({
          email: data.emailId,
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          gender: data.gender,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Saves form data AND uploads pic (if one was selected) together
  const saveCustomer = async (): Promise<void> => {
    try {
      const response = await fetch("http://localhost:5000/api/customer/saveCustomer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: form.email,
          name: form.name,
          address: form.address,
          city: form.city,
          state: form.state,
          gender: form.gender,
        }),
      });

      if (response.ok) {
        if (file) await uploadProfilePic();
        setSaved(true);
        setUpdated(false);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

 

  const inputClass =
    "w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200";
  const labelClass =
    "block text-xs font-bold text-cyan-400 mb-2 uppercase tracking-widest";
  const selectClass =
    "w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">

        {/* Header */}
        <div
          className="relative px-10 py-7 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)" }}
        >
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-lg shadow-lg">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Customer Profile</h1>
              <p className="text-slate-400 text-xs mt-0.5">Manage customer information</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-10 py-8">
          <div className="flex gap-6">

            {/* Left: Fields */}
            <div className="flex-1 space-y-5">

              {/* Email + Search */}
              <div>
                <label className={labelClass}>Email ID</label>
                <div className="flex gap-3">
                  <input
                    name="email" value={form.email} onChange={handleChange}
                    placeholder="customer@email.com" type="email"
                    className={inputClass}
                  />
                  <button
                    onClick={searchCustomer}
                    className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shadow-md shadow-cyan-900/40"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className={labelClass}>Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Full name" className={inputClass} />
              </div>

              {/* Address */}
              <div>
                <label className={labelClass}>Address</label>
                <input name="address" value={form.address} onChange={handleChange}
                  placeholder="Street address" className={inputClass} />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="City" className={inputClass} />
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

              {/* Gender */}
              <div className="w-1/2">
                <label className={labelClass}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Right: Photo */}
            <div className="flex flex-col items-center gap-3 pt-7">

              {/* Preview box */}
              <div className="w-32 h-32 rounded-xl border-2 border-slate-600 bg-slate-800 overflow-hidden flex items-center justify-center ring-2 ring-cyan-500/20">
                {profilePic ? (
                  <img src={profilePic} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-14 h-14 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                )}
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Browse — only button needed here */}
              <button
                onClick={handleBrowseClick}
                className="w-full px-5 py-2 border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all duration-200"
              >
                Browse
              </button>

              {/* Show selected filename as hint */}
              {file && (
                <p className="text-[10px] text-slate-500 text-center max-w-[128px] truncate">
                  {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {saved && (
            <div className="mt-5 px-4 py-3 bg-cyan-900/30 border border-cyan-600/40 text-cyan-400 text-sm font-medium rounded-lg text-center">
              ✓ Profile saved successfully!
            </div>
          )}
          {updated && (
            <div className="mt-5 px-4 py-3 bg-sky-900/30 border border-sky-600/40 text-sky-400 text-sm font-medium rounded-lg text-center">
              ✓ Profile updated successfully!
            </div>
          )}

          {/* Save / Update buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={saveCustomer}
              className="flex-1 py-3 bg-transparent border-2 border-cyan-500 text-cyan-400 font-bold text-sm rounded-xl hover:bg-cyan-500 hover:text-slate-900 transition-all duration-200"
            >
              Save
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md shadow-cyan-900/40"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
