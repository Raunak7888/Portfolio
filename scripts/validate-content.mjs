// Checks Data.json and Project.json. Also proves a new skill or a new
// experience entry needs nothing but JSON. Run: npm run validate:content
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const isStr = (v) => typeof v === "string" && v.trim() !== "";

const data = load("src/Data/Data.json");
const projects = load("src/Data/Project.json");

/* ---------- projects: one schema ---------- */
const STATUS = new Set(["live", "active", "building"]);
const LINKS = new Set(["repo", "live", "post"]);
const INTERACTIONS = new Set(["conversation", "depth", "filmstrip", "layers"]);
const REQUIRED = ["meta", "card", "presentation", "links", "screenshots", "technologies", "executiveSummary"];
const FORBIDDEN = ["images", "shots", "image"];

function validateProject(slug, p) {
  for (const k of REQUIRED) if (p[k] === undefined) err(`${slug}: missing "${k}"`);
  for (const k of FORBIDDEN) if (p[k] !== undefined) err(`${slug}: old property "${k}" must not exist`);
  if (!isStr(p.meta?.projectName)) err(`${slug}: meta.projectName`);
  if (!STATUS.has(p.meta?.status)) err(`${slug}: meta.status must be live, active or building`);
  for (const k of ["kind", "tagline", "summary", "tint"]) if (!isStr(p.card?.[k])) err(`${slug}: card.${k}`);
  for (const k of ["chips", "bullets", "metrics"]) if (!Array.isArray(p.card?.[k])) err(`${slug}: card.${k} must be an array`);
  if (typeof p.card?.order !== "number") err(`${slug}: card.order must be a number`);
  if (!INTERACTIONS.has(p.presentation?.interaction)) err(`${slug}: presentation.interaction must be one of ${[...INTERACTIONS].join(", ")}`);
  for (const l of p.links ?? []) if (!LINKS.has(l.kind) || !isStr(l.label) || !isStr(l.href)) err(`${slug}: bad link ${JSON.stringify(l)}`);
  for (const s of p.screenshots ?? []) {
    if (!isStr(s.src) || !isStr(s.alt)) err(`${slug}: screenshot needs src and alt`);
    else if (!fs.existsSync(path.join(root, "public", s.src))) warns.push(`${slug}: file missing on disk: public${s.src}`);
  }
  if ((p.screenshots ?? []).length === 0) warns.push(`${slug}: no screenshots`);
  for (const t of p.technologies ?? []) if (!isStr(t.name)) err(`${slug}: technology needs a name`);
  for (const k of ["oneLiner", "problemStatement", "solutionOverview"]) if (!isStr(p.executiveSummary?.[k])) err(`${slug}: executiveSummary.${k}`);
}
for (const [slug, p] of Object.entries(projects)) validateProject(slug, p);
const orders = Object.values(projects).map((p) => p.card?.order);
if (new Set(orders).size !== orders.length) err("card.order values must be unique");

/* ---------- skills ---------- */
function validateSkills(skills) {
  const ids = new Set();
  for (const s of skills) {
    if (!isStr(s.id) || !isStr(s.name)) err(`skill needs id and name: ${JSON.stringify(s)}`);
    if (ids.has(s.id)) err(`duplicate skill id: ${s.id}`);
    ids.add(s.id);
    if (s.level !== undefined && !(s.level >= 1 && s.level <= 4)) err(`skill ${s.id}: level must be 1 to 4`);
  }
  for (const s of skills) for (const r of s.related ?? []) if (!ids.has(r)) warns.push(`skill ${s.id}: related id not found: ${r}`);
}
validateSkills(data.skills?.skills ?? []);

/* ---------- experience ---------- */
function validateExperience(list) {
  if (!Array.isArray(list)) return err("experience must be an array");
  for (const j of list) for (const k of ["role", "org", "period"]) if (!isStr(j[k])) err(`experience entry needs ${k}`);
}
validateExperience(data.experience);

/* ---------- required Data.json sections ---------- */
for (const k of ["hero", "heroSection", "about", "site", "sections", "skills", "experience", "education", "writing", "footer"]) {
  if (data[k] === undefined) err(`Data.json: missing "${k}"`);
}
for (const k of ["skills", "projects", "experience", "contact"]) if (!data.sections?.[k]) err(`Data.json: sections.${k} missing`);

/* ---------- simulations: JSON-only changes must pass ---------- */
validateSkills([...(data.skills?.skills ?? []), { id: "__sim_skill", name: "Simulated", cat: "__sim_category" }]);
validateExperience([...(data.experience ?? []), { role: "Simulated role", org: "Simulated org", period: "2030" }]);
const sim = structuredClone(projects[Object.keys(projects)[0]]);
sim.card.order = 999;
validateProject("__sim_project", sim);

for (const w of warns) console.warn("warn:", w);
if (errors.length) {
  for (const e of errors) console.error("FAIL:", e);
  process.exit(1);
}
console.log(`content ok: ${Object.keys(projects).length} projects, ${(data.skills?.skills ?? []).length} skills, ${data.experience.length} experience entries`);
