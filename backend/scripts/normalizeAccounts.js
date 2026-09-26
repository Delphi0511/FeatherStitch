// One-off data migration: brings existing records in line with the schema rules
// (lowercase unique emails, "Customer"/"Tailor" roles) so the unique indexes can build.
// Usage: node scripts/normalizeAccounts.js          -> dry run, prints the plan
//        node scripts/normalizeAccounts.js --apply  -> backs up affected docs, then applies
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import CustomerProfile from "../models/CustomerProfile.js";
import TailorProfile from "../models/TailorProfile.js";

dotenv.config();

const APPLY = process.argv.includes("--apply");
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/Tailordb";
const ROLES = { customer: "Customer", tailor: "Tailor" };

const norm = (email) => String(email).trim().toLowerCase();
const groupBy = (docs, key) => {
  const groups = new Map();
  for (const doc of docs) {
    const k = norm(doc[key]);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(doc);
  }
  return groups;
};

await mongoose.connect(mongoUri);
const db = mongoose.connection.db;
const users = db.collection("users");
const customers = db.collection("customerprofiles");
const tailors = db.collection("tailorprofiles");

const backup = { users: [], customerprofiles: [], tailorprofiles: [] };
const ops = [];

// ---- Users -------------------------------------------------------------
for (const [email, group] of groupBy(await users.find().toArray(), "email")) {
  // Prefer a record with a valid role; among equals keep the oldest (the one login finds today).
  const hasRole = (u) => Boolean(ROLES[String(u.usertype ?? "").toLowerCase()]);
  const keep = [...group].sort((a, b) => (hasRole(b) - hasRole(a)) || (a._id.getTimestamp() - b._id.getTimestamp()))[0];

  for (const u of group) {
    if (u._id.equals(keep._id)) continue;
    backup.users.push(u);
    ops.push({ desc: `delete duplicate user ${u.email} (${u._id}, usertype=${u.usertype})`, run: () => users.deleteOne({ _id: u._id }) });
  }

  const set = {};
  if (keep.email !== email) set.email = email;
  const role = ROLES[String(keep.usertype ?? "").toLowerCase()];
  if (role && keep.usertype !== role) set.usertype = role;
  if (Object.keys(set).length) {
    backup.users.push(keep);
    ops.push({ desc: `update user ${keep._id}: ${JSON.stringify(set)}`, run: () => users.updateOne({ _id: keep._id }, { $set: set }) });
  }
}

// ---- Customer profiles -------------------------------------------------
for (const [email, group] of groupBy(await customers.find().toArray(), "emailId")) {
  // Keep the most recently saved profile; carry over a picture if only an older copy has one.
  const sorted = [...group].sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
  const keep = sorted[0];

  for (const c of sorted.slice(1)) {
    backup.customerprofiles.push(c);
    ops.push({ desc: `delete duplicate customer profile ${c.emailId} (${c._id}, name=${c.name})`, run: () => customers.deleteOne({ _id: c._id }) });
  }

  const set = {};
  if (keep.emailId !== email) set.emailId = email;
  if (!keep.profilePic) {
    const withPic = sorted.find((c) => c.profilePic);
    if (withPic) set.profilePic = withPic.profilePic;
  }
  if (Object.keys(set).length) {
    backup.customerprofiles.push(keep);
    ops.push({ desc: `update customer profile ${keep._id}: ${JSON.stringify(set)}`, run: () => customers.updateOne({ _id: keep._id }, { $set: set }) });
  }
}

// ---- Tailor profiles (JWT email is lowercase, so profile lookups must match) ----
for (const t of await tailors.find().toArray()) {
  if (t.email !== norm(t.email)) {
    backup.tailorprofiles.push(t);
    ops.push({ desc: `update tailor profile ${t._id}: email ${t.email} -> ${norm(t.email)}`, run: () => tailors.updateOne({ _id: t._id }, { $set: { email: norm(t.email) } }) });
  }
}

const untyped = await users.countDocuments({ usertype: { $nin: ["Customer", "Tailor", "customer", "tailor"] } });

console.log(`${ops.length} change(s) planned:`);
ops.forEach((op) => console.log("  -", op.desc));
console.log(`Note: ${untyped} user(s) have no usertype and are left untouched.`);

if (!APPLY) {
  console.log("\nDry run only. Re-run with --apply to make these changes.");
} else if (ops.length) {
  const file = `scripts/backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  fs.writeFileSync(file, JSON.stringify(backup, null, 2));
  console.log(`\nBacked up affected documents to ${file}`);
  for (const op of ops) await op.run();
  console.log("Changes applied.");
}

if (APPLY) {
  await User.createIndexes();
  await CustomerProfile.createIndexes();
  await TailorProfile.createIndexes();
  console.log("Unique indexes built.");
}

await mongoose.disconnect();
