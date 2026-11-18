#!/usr/bin/env bash
# =============================================================================
# portfolio-refinement.sh
# Run from the repository root:
#   chmod +x portfolio-refinement.sh && ./portfolio-refinement.sh
#
# Flags:   --restore <backup-dir>   put a previous backup back
# Env:     SKIP_CHECKS=1            skip install, tsc, lint and build
#          RUN_E2E=1                also run Playwright tests
# =============================================================================
set -Eeuo pipefail

ROOT="$(pwd)"
TS="$(date +%Y%m%d-%H%M%S)"
BK="$ROOT/.portfolio-backups/$TS"
PHASE="init"
TOOLS="$(mktemp -d)"

c_ok=$'\033[32m'; c_warn=$'\033[33m'; c_err=$'\033[31m'; c_dim=$'\033[2m'; c_off=$'\033[0m'
info() { printf '%s==>%s %s\n' "$c_dim" "$c_off" "$*"; }
ok()   { printf '%s ok%s %s\n' "$c_ok" "$c_off" "$*"; }
warn() { printf '%s !!%s %s\n' "$c_warn" "$c_off" "$*" >&2; }
die()  { printf '%sERR%s %s\n' "$c_err" "$c_off" "$*" >&2; exit 1; }

restore() {
  local dir="$1"
  [ -d "$dir" ] || die "Backup dir not found: $dir"
  (cd "$dir" && find . -type f ! -name .created -print0) | while IFS= read -r -d '' f; do
    f="${f#./}"; mkdir -p "$(dirname "$f")"; cp -p "$dir/$f" "$f"
  done
  if [ -f "$dir/.created" ]; then
    while IFS= read -r f; do [ -n "$f" ] && rm -f "$f"; done < "$dir/.created"
  fi
}

cleanup() { rm -rf "$TOOLS"; }
on_err() {
  local line="$1"
  trap - ERR
  if [ "$PHASE" = "write" ]; then
    warn "Failed at line $line while writing files. Restoring from $BK"
    restore "$BK" || true
    warn "Restored. Nothing was changed."
  else
    warn "Failed at line $line (phase: $PHASE)."
    warn "Your files keep the new changes. To undo them: ./portfolio-refinement.sh --restore $BK"
  fi
  exit 1
}
trap cleanup EXIT
trap 'on_err $LINENO' ERR

if [ "${1:-}" = "--restore" ]; then
  [ -n "${2:-}" ] || die "Usage: $0 --restore <backup-dir>"
  restore "$2"; ok "Restored from $2"; exit 0
fi

# -----------------------------------------------------------------------------
# helpers
# -----------------------------------------------------------------------------
bk() {
  local f="$1"
  [ -f "$f" ] || return 0
  [ -f "$BK/$f" ] && return 0
  mkdir -p "$BK/$(dirname "$f")"; cp -p "$f" "$BK/$f"
}

put() { # put <path>  (content on stdin)
  local f="$1" tmp; tmp="$(mktemp)"
  cat > "$tmp"
  if [ -f "$f" ] && cmp -s "$tmp" "$f"; then rm -f "$tmp"; info "unchanged  $f"; return 0; fi
  if [ -f "$f" ]; then bk "$f"; else echo "$f" >> "$BK/.created"; fi
  mkdir -p "$(dirname "$f")"; mv "$tmp" "$f"; chmod 644 "$f"; ok "wrote      $f"
}

remove_file() {
  local f="$1"
  [ -f "$f" ] || return 0
  bk "$f"; rm -f "$f"; ok "removed    $f"
}

# -----------------------------------------------------------------------------
# 1. verify the repository
# -----------------------------------------------------------------------------
PHASE="verify"
info "Checking repository root"
[ -f package.json ] || die "package.json not found. Run this from the repo root."
grep -q '"next"' package.json || die "This does not look like a Next.js project."
for f in src/Data/Data.json src/Data/Project.json \
         src/components/section/project/ProjectStage.tsx \
         src/components/section/project/Projects.tsx \
         src/components/section/hero/Hero.tsx \
         src/components/section/skill/Skills.tsx \
         src/components/section/skill/SkillTile.tsx \
         src/content/projects.ts src/content/skills.ts src/app/layout.tsx; do
  [ -f "$f" ] || die "Expected file missing: $f. Unexpected repository layout, stopping."
done
grep -q 'lg:sticky lg:top-0' src/components/section/project/ProjectStage.tsx \
  || die "Sticky stage markup not found in ProjectStage.tsx. Stopping so it is not broken."
command -v node >/dev/null || die "node is required."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "Node 18 or newer is required (found $NODE_MAJOR)."
node -e 'JSON.parse(require("fs").readFileSync("src/Data/Data.json","utf8"));JSON.parse(require("fs").readFileSync("src/Data/Project.json","utf8"))' \
  || die "Data.json or Project.json is not valid JSON. Fix that first."
if [ -d .git ] && [ -n "$(git status --porcelain 2>/dev/null || true)" ]; then
  warn "Git working tree has uncommitted changes. Backups are still made."
fi

detect_pm() {
  if   [ -f bun.lock ] || [ -f bun.lockb ]; then PM=bun
  elif [ -f pnpm-lock.yaml ];               then PM=pnpm
  elif [ -f yarn.lock ];                    then PM=yarn
  elif [ -f package-lock.json ];            then PM=npm
  else PM=npm; fi
  command -v "$PM" >/dev/null || die "Package manager '$PM' not found on PATH."
}
detect_pm
ok "Package manager: $PM"

mkdir -p "$BK"; : > "$BK/.created"
ok "Backups go to ${BK#$ROOT/}"
export PR_BACKUP_DIR="$BK"
PHASE="write"

# -----------------------------------------------------------------------------
# 2. node helpers
# -----------------------------------------------------------------------------
cat > "$TOOLS/lib.mjs" <<'__JS__'
import fs from "node:fs";
import path from "node:path";
const ROOT = process.cwd();
const BK = process.env.PR_BACKUP_DIR;
const rel = (f) => path.relative(ROOT, path.resolve(ROOT, f)).split(path.sep).join("/");

export function backup(f) {
  const r = rel(f), src = path.join(ROOT, r);
  if (!fs.existsSync(src)) return;
  const dst = path.join(BK, r);
  if (fs.existsSync(dst)) return;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}
export function writeText(f, text) {
  const r = rel(f), abs = path.join(ROOT, r), existed = fs.existsSync(abs);
  if (existed && fs.readFileSync(abs, "utf8") === text) return false;
  if (existed) backup(r); else fs.appendFileSync(path.join(BK, ".created"), r + "\n");
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, text);
  return true;
}
export const writeJson = (f, o) => writeText(f, JSON.stringify(o, null, f.endsWith("Project.json") ? 2 : 4) + "\n");

/** pairs: [from (string|RegExp), to (string|fn), marker?]. Fails loudly. Safe to re-run. */
export function patch(f, pairs) {
  const abs = path.join(ROOT, rel(f));
  let s = fs.readFileSync(abs, "utf8");
  const before = s;
  for (const [from, to, marker] of pairs) {
    const mk = marker ?? (typeof to === "string" ? to : null);
    if (mk && s.includes(mk)) continue;
    if (typeof from === "string") {
      const n = s.split(from).length - 1;
      if (n === 0) { if (to === "") continue; throw new Error(`${f}: pattern not found: ${JSON.stringify(from.slice(0, 70))}`); }
      if (n > 1) throw new Error(`${f}: pattern is not unique (${n}): ${JSON.stringify(from.slice(0, 70))}`);
      s = s.replace(from, () => to);
    } else {
      if (!from.test(s)) throw new Error(`${f}: regex not found: ${from}`);
      s = s.replace(from, to);
    }
  }
  if (s !== before) { backup(f); fs.writeFileSync(abs, s); console.log(`  patched   ${f}`); }
  else console.log(`  unchanged ${f}`);
}
__JS__

# -----------------------------------------------------------------------------
# 3. data migration (Project.json schema + Data.json content)
# -----------------------------------------------------------------------------
info "Migrating JSON content"
cat > "$TOOLS/migrate-content.mjs" <<'__JS__'
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { writeJson } from "./lib.mjs";

const ROOT = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const warn = (...a) => console.warn("  !!", ...a);
const data = read("src/Data/Data.json");
const projects = read("src/Data/Project.json");

/* ---------- image helpers ---------- */
const META = {};
try {
  const t = fs.readFileSync(path.join(ROOT, "src/content/image-meta.generated.ts"), "utf8");
  for (const m of t.matchAll(/"(\/uploads\/[^"]+)":\s*\{\s*"w":\s*(\d+),\s*"h":\s*(\d+)/g)) META[m[1]] = { w: +m[2], h: +m[3] };
} catch { /* optional */ }
let sharp = null;
try { sharp = createRequire(path.join(ROOT, "package.json"))("sharp"); } catch { /* optional */ }
const pub = (src) => path.join(ROOT, "public", src.replace(/^\/+/, ""));

async function resolveImage(src) {
  let use = src;
  if (!fs.existsSync(pub(src))) {
    const base = src.replace(/\.[a-z0-9]+$/i, "");
    for (const ext of [".webp", ".png", ".jpg", ".jpeg"]) {
      if (fs.existsSync(pub(base + ext))) { use = base + ext; break; }
    }
  }
  let dim = META[use];
  if (!dim && sharp && fs.existsSync(pub(use))) {
    try { const m = await sharp(pub(use)).metadata(); if (m.width && m.height) dim = { w: m.width, h: m.height }; } catch { /* ignore */ }
  }
  if (!fs.existsSync(pub(use))) warn(`image file missing on disk: public${use}`);
  return { use, dim };
}

/* ---------- project seeds (the card content that used to live in projects.ts) ---------- */
const SEED = {
  hermes: {
    status: "live", kind: "Featured · Full-stack app", tint: "oklch(0.68 0.14 235)",
    tagline: "Private chats the server cannot read.",
    summary: "A real-time chat platform with end-to-end encrypted private messages and group chat. It runs on a self-managed k3s cluster on GCP that I provisioned and configured myself. Group messages are not end-to-end encrypted.",
    chips: ["Java", "Spring Boot", "React", "TypeScript", "k3s"],
    bullets: [
      "Private chats: ECDH P-256 key exchange and AES-GCM per message, in the browser",
      "Real-time chat over WebSocket/STOMP with presence and typing indicators",
      "Redis sliding-window rate limiting per user",
      "Terraform and Ansible provision the GCP cluster. A GitHub Actions pipeline with Trivy scans is written and not yet switched on",
    ],
    metrics: [{ value: 2, label: "GCP VMs" }, { value: 24, suffix: "h", label: "message history" }, { value: "AES-GCM", label: "private chat encryption" }],
    interaction: "conversation", readout: "hover or tap to watch the thread",
    alt: "Hermes chat interface showing a private conversation",
  },
  pokeverse: {
    status: "active", kind: "Game platform", tint: "oklch(0.72 0.16 75)",
    tagline: "One platform, many multiplayer games.",
    summary: "A real-time multiplayer platform that provides the shared parts (authentication, rooms, event routing, chat and state) so each new game only has to bring its own rules. One game module exists so far.",
    chips: ["Java", "Spring Boot", "Next.js", "PostgreSQL", "Redis"],
    bullets: [
      "Shared auth, rooms, chat and event routing for every game",
      "PostgreSQL 17 with Flyway for history, Redis for live scores",
      "Pokémon Quiz in single-player and room-based multiplayer",
      "Game modules plug in and bring only their own rules",
    ],
    metrics: [{ value: 2, label: "data stores" }, { value: 1, label: "game module" }, { value: "STOMP", label: "room events" }],
    interaction: "depth", readout: "move over it to shift the layers",
    alt: "Pokeverse Pokémon Quiz game screen",
  },
  calculate: {
    status: "active", kind: "Python library", tint: "oklch(0.68 0.17 10)",
    tagline: "A scientific calculator with no eval(), on purpose.",
    summary: "A scientific expression evaluator built from scratch with classic compiler techniques. It explores what really happens between typing an expression and seeing a number.",
    chips: ["Python 3.13", "Shunting-Yard", "RPN", "uv"],
    bullets: [
      "Tokenizer, implicit multiplication, Shunting-Yard, stack evaluator",
      "50+ functions and 70+ operators with domain checks",
      "100+ test cases and no external math dependencies",
      "Explained in a public Medium article",
    ],
    metrics: [{ value: 50, suffix: "+", label: "functions" }, { value: 70, suffix: "+", label: "operators" }, { value: 100, suffix: "+", label: "test cases" }],
    interaction: "filmstrip", readout: "hover to browse the screenshots",
    alt: "Calculate expression evaluator test output",
  },
  algoforge: {
    status: "building", kind: "In development · AI dev tool", tint: "oklch(0.66 0.17 295)",
    tagline: "Code in, explanation and visualization out.",
    summary: "Work in progress. An AI-assisted code understanding tool that aims to turn source code into structured explanations and algorithm visualizations. No public link yet.",
    chips: ["Next.js", "Express", "Prisma", "Gemini"],
    bullets: [
      "Separate stages: analysis, visualization JSON, rendering",
      "ForgeCode turns code and AI analysis into visualizer JSON",
      "Workspace drafts, explanation sessions and usage quotas",
      "SHA-256 deduplication, reported at about 60% less duplicate processing",
    ],
    metrics: [{ value: 60, suffix: "%", label: "reported less duplicate work" }, { value: 3, label: "pipeline stages" }, { value: "JSON", label: "visualizer contract" }],
    interaction: "layers", readout: "hover to fan out the sheets",
    alt: "AlgoForge workspace screenshot",
  },
};
const PALETTE = ["oklch(0.68 0.14 235)", "oklch(0.72 0.16 75)", "oklch(0.68 0.17 10)", "oklch(0.66 0.17 295)", "oklch(0.72 0.17 150)"];
function genericSeed(slug, old, order) {
  const es = old.executiveSummary ?? {};
  return {
    status: "active", kind: "Project", tint: PALETTE[(order - 1) % PALETTE.length],
    tagline: es.oneLiner ?? "", summary: es.solutionOverview ?? es.oneLiner ?? "",
    chips: [], bullets: (es.keyCapabilities ?? []).slice(0, 4), metrics: [],
    interaction: "filmstrip", readout: "hover to browse the screenshots", alt: `${old.meta?.projectName ?? slug} screenshot`,
  };
}
const cap = (k) => (k === "ai" ? "AI" : k.charAt(0).toUpperCase() + k.slice(1));
function stackToTech(stack) {
  const out = [];
  for (const [key, arr] of Object.entries(stack ?? {})) {
    if (!Array.isArray(arr)) continue;
    for (const it of arr) {
      const name = typeof it === "string" ? it : it?.name;
      if (name) out.push({ name, category: cap(key) });
    }
  }
  return out;
}

const HANDLED = new Set(["meta", "images", "shots", "screenshots", "executiveSummary", "roadmap", "card", "presentation", "links", "technologies"]);
const DROP_META = new Set(["live", "repository", "post", "status", "lastUpdated", "projectName"]);

async function migrate(slug, old, order) {
  const meta = old.meta ?? {};
  const name = meta.projectName ?? slug;
  const seed = SEED[slug] ?? genericSeed(slug, old, order);

  const links = [];
  if (meta.live) links.push({ kind: "live", label: "Live demo", href: meta.live });
  if (meta.repository) links.push({ kind: "repo", label: "Source", href: meta.repository });
  if (meta.post) links.push({ kind: "post", label: "Article", href: meta.post });

  const srcs = [...new Set([
    ...(old.images ?? []), ...(old.shots ?? []),
    ...(old.screenshots ?? []).map((s) => (typeof s === "string" ? s : s.src)),
  ])].filter((s) => typeof s === "string" && s.startsWith("/"));
  const screenshots = [];
  for (const [i, src] of srcs.entries()) {
    const { use, dim } = await resolveImage(src);
    screenshots.push({ src: use, alt: i === 0 ? seed.alt : `${name} screenshot ${i + 1}`, ...(dim ? { width: dim.w, height: dim.h } : {}) });
  }
  if (screenshots.length !== srcs.length) throw new Error(`${slug}: screenshots were lost in migration`);

  const fromData = (data.projects ?? []).find((p) => p.id === slug)?.technologies;
  const technologies = (fromData ?? stackToTech(old.technologyStack)).map((t) => ({ name: t.name, ...(t.category ? { category: t.category } : {}) }));

  const newMeta = { projectName: name, status: seed.status };
  for (const [k, v] of Object.entries(meta)) {
    if (DROP_META.has(k)) continue;
    if (v === "" || v == null) continue;
    newMeta[k] = v;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(meta.lastUpdated ?? "")) newMeta.lastUpdated = meta.lastUpdated;

  const rec = {
    meta: newMeta,
    card: { order, kind: seed.kind, tagline: seed.tagline, summary: seed.summary, tint: seed.tint, chips: seed.chips, bullets: seed.bullets, metrics: seed.metrics, readout: seed.readout },
    presentation: { interaction: seed.interaction },
    links,
    screenshots,
    technologies,
    executiveSummary: old.executiveSummary,
    ...(old.roadmap ? { roadmap: old.roadmap } : {}),
  };
  for (const [k, v] of Object.entries(old)) if (!HANDLED.has(k)) rec[k] = v;
  return rec;
}

const out = {};
let order = 0;
for (const [slug, old] of Object.entries(projects)) {
  order += 1;
  out[slug] = old.card && old.screenshots && old.presentation ? old : await migrate(slug, old, order);
}
if (Object.keys(out).length !== Object.keys(projects).length) throw new Error("Project count changed");

/* ---------- Data.json ---------- */
const fill = (obj, ext) => { const o = { ...(obj ?? {}) }; for (const [k, v] of Object.entries(ext)) if (o[k] === undefined) o[k] = v; return o; };

data.hero = fill(data.hero, {
  eyebrow: "Open to full-stack roles",
  greeting: "Hello, I'm",
  role: { before: "Full-Stack", highlight: "Developer" },
  intro: { before: "I turn", emphasis: "hard problems", middle: "into", after: "people love." },
  rotatorWords: ["products", "APIs", "interfaces", "systems"],
  stickers: [{ label: "Next.js", tilt: -4 }, { label: "TypeScript", tilt: 3 }, { label: "AI agents", tilt: -2 }, { label: "Spring Boot", tilt: 4 }],
  primaryCta: { label: "See Hermes, my main project", href: "#projects" },
  secondaryCta: { label: "Get in touch", href: "#contact" },
});

data.about = fill(data.about, {
  greeting: "Hey, I'm Raunak",
  headingTop: "Curious about",
  headingBottom: "how things work.",
  paragraph: "I'm a BCA graduate and full-stack developer. I started with Java and Spring Boot, then moved into React and TypeScript. I enjoy building things, trying new ideas, and figuring out how everything fits together.",
  half: "I like knowing why something works, not just that it does.",
  currently: "Currently exploring",
  topics: ["AI", "system design", "new ideas"],
  cta: { label: "A little more about me", href: "#about" },
  pillars: [
    { id: "understand", iconKey: "view", kicker: "How I think", title: "Understand first", text: "I like figuring out the problem before jumping into a solution. Simple and clear is usually better.", emoji: "🦆", backTitle: "Rubber duck approved", backText: "Sometimes I explain bugs to a duck. Surprisingly, it helps more than you'd think.", tint: "oklch(0.72 0.16 75)", tilt: -2 },
    { id: "stack", iconKey: "layers", kicker: "How I build", title: "A bit of everything", text: "From APIs and databases to user interfaces, I enjoy bringing all the pieces together.", emoji: "🧩", backTitle: "Pieces that fit", backText: "There's something satisfying about seeing everything finally work together.", tint: "oklch(0.68 0.14 235)", tilt: 1.5 },
    { id: "learn", iconKey: "refresh", kicker: "How I learn", title: "Learn by doing", text: "I learn by trying things, making mistakes, and figuring out how to fix them.", emoji: "🐛", backTitle: "Bugs happen", backText: "Every bug has something to teach. Some just take longer to explain themselves.", tint: "oklch(0.68 0.17 10)", tilt: 2 },
    { id: "next", iconKey: "rocket", kicker: "What's next", title: "Always growing", text: "There's always something new to learn, and I like keeping that curiosity alive.", emoji: "🔭", backTitle: "What's on the horizon?", backText: "Exploring AI, system design, and building things that can grow with more users.", tint: "oklch(0.66 0.17 295)", tilt: -1.5 },
  ],
  mascotLines: ["Hey! I'm Blob 👋", "Go on, move the cards!", "Psst... try flipping one.", "I help Raunak find bugs. Sometimes.", "Flip all four for a surprise!", "Hehe, that tickles!"],
});

data.site = fill(data.site, {
  location: "Delhi NCR, India",
  timezone: "Asia/Kolkata",
  stack: ["Java", "Spring Boot", "React", "Next.js", "TypeScript", "Tailwind CSS", "Docker", "Kubernetes", "GCP", "Terraform", "Ansible", "GitHub Actions"],
});

data.sections = fill(data.sections, {
  skills: { index: "02", badge: "Skills", headingTop: "The toolbox", headingBottom: "I build with.", hintFine: "Click a tile, or move with the arrow keys.", hintTouch: "Tap a tile to see how I use it.", emptyTitle: "Pick a tile", emptyText: "See how I use it and what it pairs with.", done: "Whole toolbox explored 🎉", allBlurb: "Everything in the box." },
  projects: { index: "03", badge: "Projects", headingTop: "Things I've", headingBottom: "built.", hintFine: "Scroll", hintTouch: "Swipe down through the builds.", outroTitle: "There is more where this came from.", outroText: "Every repo, commit and experiment lives on my GitHub.", outroCta: "Open GitHub", comingSoon: "Public link coming soon", caseStudy: "Read case study" },
  experience: { index: "04", badge: "Experience", headingTop: "Where I've", headingBottom: "learned.", educationLabel: "Education", writingLabel: "Writing" },
  contact: {
    index: "05", badge: "Contact", headingTop: "Got an idea?", headingBottom: "Say hi.",
    intro: "Have a project, a role or a question? Email me directly, or use the form. I read every message myself and usually reply within a day.",
    primaryCta: "Email me", copyLabel: "Copy email", copiedLabel: "Copied",
    availability: "Open to full-stack roles", replyTime: "Usually within a day",
    formTitle: "Send a message", topicsLabel: "What is it about?",
    topics: [{ id: "idea", label: "An idea" }, { id: "job", label: "A job" }, { id: "team", label: "Teaming up" }, { id: "hi", label: "Just hello" }],
    submitLabel: "Send message", successTitle: "Message sent",
    successText: "Thanks for writing. I will reply soon.",
  },
});

if (!Array.isArray(data.experience) || !data.experience[0]?.role) {
  data.experience = [{
    role: "Software Developer Intern", org: "ILN Global", period: "2026",
    summary: "Frontend and backend work on Tatito Health+, a healthcare platform with a Django backend and a JavaScript frontend.",
    points: [
      "Built a clinic version of an existing hospital dashboard.",
      "Reworked the doctor page: appointment booking, fee discounts and reviews. Booking now happens only after payment succeeds.",
      "Working on Doctor Management: automatic, unique doctor IDs.",
    ],
    stack: ["JavaScript", "Vite", "Django"],
  }];
}
data.education ??= [{ degree: "Bachelor of Computer Applications (BCA)", school: "DAV Institute of Management, Faridabad", year: "2026" }];
data.writing ??= [{ title: "How I built a better calculator using the Shunting-Yard algorithm", source: "Medium", href: "https://medium.com/@raunakyadav7888/how-i-built-a-better-calculator-using-the-shunting-yard-algorithm-b359b8826045" }];
data.footer = fill(data.footer, { availability: "Open to new projects", copyright: "All rights reserved." });

if (!data.skills?.categories) {
  const S = (id, name, mark, cat, level, note, usedIn, related) => ({ id, name, mark, cat, level, note, ...(usedIn ? { usedIn } : {}), related });
  data.skills = {
    levels: ["Learning", "Comfortable", "Strong", "Daily driver"],
    categories: [
      { id: "languages", label: "Languages", blurb: "What I write most of my code in.", tint: "oklch(0.72 0.16 75)" },
      { id: "backend", label: "Backend", blurb: "Where the data and the logic live.", tint: "oklch(0.68 0.17 10)" },
      { id: "frontend", label: "Frontend", blurb: "What people actually see and touch.", tint: "oklch(0.68 0.14 235)" },
      { id: "tooling", label: "Infra & delivery", blurb: "How Hermes gets built, shipped and run.", tint: "oklch(0.66 0.17 295)" },
    ],
    skills: [
      S("java", "Java", "Ja", "languages", 3, "Where I started, and what I use for every backend. It taught me to think in types, objects and structure.", "Hermes, Pokeverse", ["spring", "rest", "sql"]),
      S("typescript", "TypeScript", "TS", "languages", 4, "Types catch my mistakes before users do. I reach for it on every frontend.", "This portfolio, Hermes UI, AlgoForge", ["react", "next", "javascript"]),
      S("javascript", "JavaScript", "JS", "languages", 3, "The language underneath it all. I like knowing what the compiler is hiding.", "", ["typescript", "react", "next"]),
      S("python", "Python", "Py", "languages", 2, "For small, sharp tools. Calculate is a parser and evaluator with 100+ tests.", "Calculate", ["java", "typescript", "docker"]),
      S("spring", "Spring Boot", "Sb", "backend", 3, "REST, WebSocket/STOMP, Security and JPA. My go-to backend, learned by building and breaking things.", "Hermes, Pokeverse", ["java", "rest", "sql", "redis"]),
      S("rest", "REST APIs", "API", "backend", 3, "Clear routes, predictable responses, plus JWT and Google OAuth2 sign-in.", "Hermes, Pokeverse", ["spring", "next", "sql"]),
      S("sql", "SQL", "SQL", "backend", 2, "MySQL in Hermes. PostgreSQL with Flyway migrations in Pokeverse.", "Hermes, Pokeverse", ["spring", "rest", "java"]),
      S("redis", "Redis", "Rd", "backend", 2, "Rate limiting, caching and live game state.", "Hermes, Pokeverse", ["spring", "rest", "docker"]),
      S("react", "React", "Re", "frontend", 4, "Where I fell for the frontend. Small components that compose into whole screens.", "This portfolio, Hermes, Pokeverse", ["typescript", "next", "tailwind"]),
      S("next", "Next.js", "Nx", "frontend", 4, "Routing, rendering and deployment in one place, so I can focus on the product.", "This portfolio, Pokeverse, AlgoForge", ["react", "typescript", "tailwind"]),
      S("tailwind", "Tailwind CSS", "Tw", "frontend", 4, "Utility classes keep spacing and colour consistent without leaving the markup.", "This portfolio, Pokeverse", ["react", "next", "framer"]),
      S("framer", "Framer Motion", "Fm", "frontend", 3, "Springs and gestures that respond to the visitor instead of looping on their own.", "This portfolio", ["react", "tailwind", "typescript"]),
      S("docker", "Docker", "Dk", "tooling", 3, "Multi-stage builds, non-root users and Compose for local development.", "Hermes, Pokeverse", ["kubernetes", "ci", "spring"]),
      S("kubernetes", "Kubernetes (k3s)", "K8", "tooling", 2, "A two-VM k3s cluster on GCP: deployments, ingress and default-deny network policies.", "Hermes", ["docker", "terraform", "ci"]),
      S("ci", "GitHub Actions", "CI", "tooling", 2, "A pipeline for Hermes: tests, Trivy scan, Docker build and rollout. Written, not yet switched on.", "Hermes", ["docker", "kubernetes", "terraform"]),
      S("terraform", "Terraform & Ansible", "Tf", "tooling", 2, "Terraform builds the GCP network and VMs. Ansible sets up k3s, hardening and monitoring.", "Hermes", ["kubernetes", "docker", "ci"]),
    ],
  };
}

// Data.projects is now absorbed into Project.json (technologies). Remove only if nothing reads it.
if (data.projects !== undefined) {
  const hits = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== "Data" && e.name !== "node_modules") walk(p); }
      else if (/\.(ts|tsx)$/.test(e.name) && /\b(?:data|Data)\.projects\b/.test(fs.readFileSync(p, "utf8"))) hits.push(p);
    }
  };
  walk(path.join(ROOT, "src"));
  if (hits.length) warn(`Data.json "projects" is still read by: ${hits.join(", ")}. Left in place.`);
  else { delete data.projects; console.log("  removed duplicate Data.json 'projects' (merged into Project.json)"); }
}

const a = writeJson("src/Data/Project.json", out);
const b = writeJson("src/Data/Data.json", data);
console.log(`  Project.json ${a ? "updated" : "unchanged"}, Data.json ${b ? "updated" : "unchanged"}`);
__JS__
(cd "$TOOLS" && true)
node "$TOOLS/migrate-content.mjs" || die "JSON migration failed"
# lib.mjs imports must resolve from TOOLS: run via node with the file in TOOLS (done above).

# -----------------------------------------------------------------------------
# 4. types, content loaders
# -----------------------------------------------------------------------------
info "Writing types and content loaders"

put src/types/portfolio.ts <<'__TS__'
/** Types for every JSON content file. Change the JSON, not the components. */

export type StatusKind = "live" | "active" | "building";
export type LinkKind = "repo" | "live" | "post";
export type Metric = { value: number | string; suffix?: string; label: string };
export type ProjectLink = { kind: LinkKind; label: string; href: string };
export type Screenshot = { src: string; alt: string; width?: number; height?: number };
export type Technology = { name: string; category?: string };

/** The one schema every entry in Project.json follows. The key is the slug. */
export type ProjectRecord = {
    meta: {
        projectName: string;
        status: StatusKind;
        codename?: string;
        version?: string;
        lastUpdated?: string;
        maintainers?: string[];
        license?: string;
    };
    card: {
        order: number;
        kind: string;
        tagline: string;
        summary: string;
        tint: string;
        chips: string[];
        bullets: string[];
        metrics: Metric[];
        readout?: string;
    };
    /** Picks one of the shared hover interactions. See components/section/project/media. */
    presentation: { interaction: string };
    links: ProjectLink[];
    screenshots: Screenshot[];
    technologies: Technology[];
    executiveSummary: {
        oneLiner: string;
        problemStatement: string;
        solutionOverview: string;
        primaryUsers?: string[];
        keyCapabilities: string[];
        knownLimitations: string[];
    };
    roadmap?: { shortTerm?: string[]; midTerm?: string[]; longTerm?: string[] };
    architecture?: unknown;
    technologyStack?: unknown;
    engineeringImprovements?: unknown;
};

/** Flat shape used by the project stage. Built from ProjectRecord in content/projects.ts. */
export type Project = {
    id: string;
    name: string;
    kind: string;
    tint: string;
    status: StatusKind;
    cardLine: string;
    summary: string;
    chips: string[];
    bullets: string[];
    metrics: Metric[];
    links: ProjectLink[];
    caseStudy: string;
    screenshots: Screenshot[];
    interaction: string;
    readout?: string;
};

export type Cta = { label: string; href: string };

export type HeroData = {
    firstName: string;
    secondName?: string;
    fullName: string;
    email: string;
    eyebrow?: string;
    greeting?: string;
    role?: { before: string; highlight: string };
    intro?: { before: string; emphasis: string; middle: string; after: string };
    rotatorWords?: string[];
    stickers?: { label: string; tilt?: number }[];
    primaryCta?: Cta;
    secondaryCta?: Cta;
};

export type PillarInput = {
    id: string;
    iconKey?: string;
    kicker: string;
    title: string;
    text: string;
    emoji?: string;
    backTitle?: string;
    backText?: string;
    tint?: string;
    tilt?: number;
};

export type AboutData = {
    greeting: string;
    headingTop: string;
    headingBottom: string;
    paragraph: string;
    half: string;
    currently: string;
    topics?: string[];
    cta?: Cta;
    pillars?: PillarInput[];
    mascotLines?: string[];
};

type Heading = { index?: string; badge: string; headingTop: string; headingBottom: string };
export type SkillsCopy = Heading & {
    hintFine: string; hintTouch: string; emptyTitle: string; emptyText: string; done: string; allBlurb?: string;
};
export type ProjectsCopy = Heading & {
    hintFine: string; hintTouch: string; outroTitle: string; outroText: string; outroCta: string; comingSoon: string; caseStudy: string;
};
export type ExperienceCopy = Heading & { educationLabel?: string; writingLabel?: string };
export type ContactCopy = Heading & {
    intro: string;
    primaryCta: string;
    copyLabel?: string;
    copiedLabel?: string;
    availability?: string;
    replyTime?: string;
    formTitle: string;
    topicsLabel: string;
    topics: { id: string; label: string }[];
    submitLabel: string;
    successTitle: string;
    successText: string;
};

export type SkillInput = {
    id: string;
    name: string;
    mark?: string;
    cat?: string;
    level?: number;
    note?: string;
    usedIn?: string;
    related?: string[];
};
export type CategoryInput = { id: string; label?: string; blurb?: string; tint?: string };

export type ExperienceEntry = {
    role: string;
    org: string;
    period: string;
    location?: string;
    summary?: string;
    points?: string[];
    stack?: string[];
    link?: { label: string; href: string };
};
export type EducationEntry = { degree: string; school: string; year?: string };
export type WritingEntry = { title: string; source?: string; href: string };

export type PortfolioData = {
    hero: HeroData;
    heroSection: { description?: string; socialLinks: Record<string, string>; viewSourceGithubLinkUrl?: string };
    about: AboutData;
    site: { location: string; timezone: string; stack: string[] };
    sections: {
        skills: SkillsCopy;
        projects: ProjectsCopy;
        experience: ExperienceCopy;
        contact: ContactCopy;
    };
    skills: { levels?: string[]; categories?: CategoryInput[]; skills: SkillInput[] };
    experience: ExperienceEntry[];
    education: EducationEntry[];
    writing: WritingEntry[];
    footer: { note?: string; availability?: string; copyright?: string };
};
__TS__

put src/content/data.ts <<'__TS__'
import raw from "@/Data/Data.json";
import type { PortfolioData } from "@/types/portfolio";

/** The one typed handle on Data.json. Every section reads its content from here. */
export const portfolio = raw as unknown as PortfolioData;
__TS__

put src/content/projects.ts <<'__TS__'
import raw from "@/Data/Project.json";
import { portfolio } from "./data";
import type { Project, ProjectRecord, StatusKind } from "@/types/portfolio";

export type { Project, ProjectRecord, StatusKind, LinkKind, Metric, ProjectLink, Screenshot, Technology } from "@/types/portfolio";

const s = portfolio.sections.projects;

export const copy = {
    index: s.index ?? "03",
    badge: s.badge,
    headingTop: s.headingTop,
    headingBottom: s.headingBottom,
    hintFine: s.hintFine,
    hintTouch: s.hintTouch,
    outroTitle: s.outroTitle,
    outroText: s.outroText,
    outroCta: s.outroCta,
    comingSoon: s.comingSoon,
    caseStudy: s.caseStudy,
    githubProfile: portfolio.heroSection.socialLinks.githubUrl,
};

export const STATUS: Record<StatusKind, { label: string; color: string }> = {
    live: { label: "Live", color: "oklch(0.72 0.17 150)" },
    active: { label: "Active", color: "oklch(0.68 0.14 235)" },
    building: { label: "In development", color: "oklch(0.72 0.16 75)" },
};

/** Every project record, keyed by slug. */
export const RECORDS = raw as unknown as Record<string, ProjectRecord>;

/** Cards in display order. Adding a project means adding an entry to Project.json. */
export const PROJECTS: Project[] = Object.entries(RECORDS)
    .filter(([, r]) => !!r?.card)
    .sort((a, b) => (a[1].card.order ?? 99) - (b[1].card.order ?? 99))
    .map(([id, r]) => ({
        id,
        name: r.meta.projectName,
        kind: r.card.kind ?? "Project",
        tint: r.card.tint ?? "var(--primary)",
        status: r.meta.status ?? "active",
        cardLine: r.card.tagline ?? r.executiveSummary?.oneLiner ?? "",
        summary: r.card.summary ?? "",
        chips: r.card.chips ?? [],
        bullets: r.card.bullets ?? [],
        metrics: r.card.metrics ?? [],
        links: r.links ?? [],
        caseStudy: `/projects/${id}`,
        screenshots: r.screenshots ?? [],
        interaction: r.presentation?.interaction ?? "filmstrip",
        readout: r.card.readout,
    }));

export const TOTAL = PROJECTS.length;
__TS__

put src/content/skills.ts <<'__TS__'
import { portfolio } from "./data";

const s = portfolio.sections.skills;

export const copy = {
    index: s.index ?? "02",
    badge: s.badge,
    headingTop: s.headingTop,
    headingBottom: s.headingBottom,
    hintFine: s.hintFine,
    hintTouch: s.hintTouch,
    emptyTitle: s.emptyTitle,
    emptyText: s.emptyText,
    done: s.done,
    allBlurb: s.allBlurb ?? "Everything in the box.",
};

export type CatId = string;
export type FilterId = string;
export type Category = { id: FilterId; label: string; blurb: string; tint: string };
export type Skill = {
    id: string;
    name: string;
    mark: string;
    cat: CatId;
    level: 1 | 2 | 3 | 4;
    note: string;
    usedIn?: string;
    related: string[];
};

const PALETTE = [
    "oklch(0.72 0.16 75)",
    "oklch(0.68 0.17 10)",
    "oklch(0.68 0.14 235)",
    "oklch(0.66 0.17 295)",
    "oklch(0.72 0.17 150)",
];

export const LEVELS: readonly string[] = portfolio.skills.levels?.length
    ? portfolio.skills.levels
    : ["Learning", "Comfortable", "Strong", "Daily driver"];

const titleCase = (v: string) => v.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const markOf = (name: string) => {
    const w = name.split(/[\s.&()]+/).filter(Boolean);
    const m = w.length > 1 ? w[0][0] + w[1][0] : name.slice(0, 2);
    return m.charAt(0).toUpperCase() + m.slice(1);
};
const clampLevel = (n: unknown): 1 | 2 | 3 | 4 => {
    const v = Math.round(typeof n === "number" ? n : 2);
    return Math.min(4, Math.max(1, v)) as 1 | 2 | 3 | 4;
};

const seen = new Set<string>();
const list = (portfolio.skills.skills ?? []).filter((x) => {
    if (!x?.id || !x?.name || seen.has(x.id)) return false;
    seen.add(x.id);
    return true;
});

/** Skills with every optional field filled in. */
export const SKILLS: Skill[] = list.map((x) => ({
    id: x.id,
    name: x.name,
    mark: x.mark ?? markOf(x.name),
    cat: x.cat ?? "other",
    level: clampLevel(x.level),
    note: x.note ?? "",
    usedIn: x.usedIn || undefined,
    related: (x.related ?? []).filter((r) => seen.has(r) && r !== x.id),
}));

const declared = new Map((portfolio.skills.categories ?? []).map((c) => [c.id, c]));
const used: string[] = [];
for (const sk of SKILLS) if (!used.includes(sk.cat)) used.push(sk.cat);
// declared categories keep their JSON order; unknown ones are added automatically
const ordered = [
    ...(portfolio.skills.categories ?? []).map((c) => c.id).filter((id) => used.includes(id)),
    ...used.filter((id) => !declared.has(id)),
];

export const CATEGORIES: Category[] = [
    { id: "all", label: "All", blurb: copy.allBlurb, tint: "var(--primary)" },
    ...ordered.map((id, i) => {
        const c = declared.get(id);
        return {
            id,
            label: c?.label ?? titleCase(id),
            blurb: c?.blurb ?? "",
            tint: c?.tint ?? PALETTE[i % PALETTE.length],
        };
    }),
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((x) => [x.id, x]));
export const CAT_BY_ID: Record<string, Category> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const COLS = 4;
__TS__

put src/content/about.ts <<'__TS__'
import { ViewIcon, Layers01Icon, RefreshIcon, Rocket01Icon } from "@hugeicons/core-free-icons";
import { portfolio } from "./data";

const ICONS = { view: ViewIcon, layers: Layers01Icon, refresh: RefreshIcon, rocket: Rocket01Icon } as const;
type IconKey = keyof typeof ICONS;

const a = portfolio.about;

export const about = {
    greeting: a.greeting,
    headingTop: a.headingTop,
    headingBottom: a.headingBottom,
    paragraph: a.paragraph,
    half: a.half,
    currently: a.currently,
    topics: a.topics ?? [],
    cta: a.cta ?? { label: "", href: "#about" },
};

export type Pillar = {
    id: string;
    icon: typeof ViewIcon;
    kicker: string;
    title: string;
    text: string;
    emoji: string;
    backTitle: string;
    backText: string;
    tint: string;
    tilt: number;
};

const TINTS = ["oklch(0.72 0.16 75)", "oklch(0.68 0.14 235)", "oklch(0.68 0.17 10)", "oklch(0.66 0.17 295)"];

export const PILLARS: Pillar[] = (a.pillars ?? []).map((p, i) => ({
    id: p.id,
    icon: ICONS[(p.iconKey ?? "view") as IconKey] ?? ViewIcon,
    kicker: p.kicker,
    title: p.title,
    text: p.text,
    emoji: p.emoji ?? "✨",
    backTitle: p.backTitle ?? p.title,
    backText: p.backText ?? p.text,
    tint: p.tint ?? TINTS[i % TINTS.length],
    tilt: p.tilt ?? 0,
}));

export const MASCOT_LINES = a.mascotLines?.length ? a.mascotLines : ["Hey!"];
__TS__

put src/content/experience.ts <<'__TS__'
import { portfolio } from "./data";

const s = portfolio.sections.experience;

export const copy = {
    index: s.index ?? "04",
    badge: s.badge,
    headingTop: s.headingTop,
    headingBottom: s.headingBottom,
    educationLabel: s.educationLabel ?? "Education",
    writingLabel: s.writingLabel ?? "Writing",
};

export const experience = portfolio.experience ?? [];
export const education = portfolio.education ?? [];
export const writing = portfolio.writing ?? [];
__TS__

put src/content/site.ts <<'__TS__'
import { portfolio } from "./data";

const links = portfolio.heroSection.socialLinks;
const LABELS: Record<string, string> = {
    githubUrl: "GitHub",
    linkedInUrl: "LinkedIn",
    instagramUrl: "Instagram",
    twitterUrl: "X",
    youtubeUrl: "YouTube",
};

/** Identity, links and the tech ticker. All values come from Data.json. */
export const site = {
    firstName: portfolio.hero.firstName,
    fullName: portfolio.hero.fullName,
    email: portfolio.hero.email,
    location: portfolio.site.location,
    timezone: portfolio.site.timezone,
    social: Object.entries(links)
        .filter(([k, v]) => k !== "gmailUrl" && typeof v === "string" && v)
        .map(([k, v]) => ({
            label: LABELS[k] ?? k.replace(/Url$/, "").replace(/^./, (c) => c.toUpperCase()),
            href: v,
        })),
    stack: portfolio.site.stack,
    nav: [
        { label: "Home", href: "#home" },
        { label: "About", href: "#about" },
        { label: "Skills", href: "#skills" },
        { label: "Projects", href: "#projects" },
        { label: "Experience", href: "#experience" },
        { label: "Contact", href: "#contact" },
    ],
};
__TS__

# -----------------------------------------------------------------------------
# 5. shared link system
# -----------------------------------------------------------------------------
info "Writing link system and styles"

put src/styles/links.css <<'__CSS__'
/* One link system. Underline reveal for text links, a small nudge for list links. */
.lnk {
    background-image: linear-gradient(currentColor, currentColor);
    background-repeat: no-repeat;
    background-position: 100% 100%;
    background-size: 0% 1px;
    padding-bottom: 2px;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    transition: background-size 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.lnk:hover,
.lnk:focus-visible {
    background-position: 0 100%;
    background-size: 100% 1px;
}
.lnk-nudge {
    display: inline-block;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), color 0.2s;
}
.lnk-nudge:hover,
.lnk-nudge:focus-visible {
    transform: translateX(4px);
}
.lnk-lift {
    display: inline-flex;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.lnk-lift:hover,
.lnk-lift:focus-visible {
    transform: translateY(-2px);
}
.lnk-arrow {
    display: inline-block;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.lnk:hover .lnk-arrow,
.lnk:focus-visible .lnk-arrow,
.lnk-nudge:hover .lnk-arrow,
.lnk-nudge:focus-visible .lnk-arrow {
    transform: translate(2px, -2px);
}
.lnk:focus-visible,
.lnk-nudge:focus-visible,
.lnk-lift:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
    border-radius: 3px;
}
@media (prefers-reduced-motion: reduce) {
    .lnk,
    .lnk-nudge,
    .lnk-lift,
    .lnk-arrow {
        transition: none;
    }
    .lnk-nudge:hover,
    .lnk-nudge:focus-visible,
    .lnk-lift:hover,
    .lnk-lift:focus-visible,
    .lnk:hover .lnk-arrow,
    .lnk-nudge:hover .lnk-arrow {
        transform: none;
    }
}
__CSS__

put src/components/ui/AnimatedLink.tsx <<'__TSX__'
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type Props = {
    href: string;
    children: ReactNode;
    /** underline: inline text links. nudge: items in a list. */
    variant?: "underline" | "nudge";
    external?: boolean;
    /** Show the ↗ mark. Defaults to true for external links. */
    arrow?: boolean;
    className?: string;
    ariaLabel?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * The only way to write an animated text link. Handles external links,
 * mailto, in-page anchors and Next routes. Hover and keyboard focus look the
 * same, and reduced motion turns the movement off (see styles/links.css).
 */
export default function AnimatedLink({
    href,
    children,
    variant = "underline",
    external,
    arrow,
    className = "",
    ariaLabel,
    onClick,
}: Props) {
    const isExternal = external ?? /^https?:/.test(href);
    const plain = isExternal || /^(mailto:|tel:|#)/.test(href);
    const cls = `${variant === "nudge" ? "lnk-nudge" : "lnk"} ${className}`.trim();
    const showArrow = arrow ?? isExternal;
    const content = (
        <>
            {children}
            {showArrow && <span aria-hidden className="lnk-arrow">{"\u00A0↗"}</span>}
        </>
    );

    if (plain) {
        return (
            <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-label={ariaLabel}
                onClick={onClick}
                className={cls}
            >
                {content}
            </a>
        );
    }
    return (
        <Link href={href} aria-label={ariaLabel} onClick={onClick} className={cls}>
            {content}
        </Link>
    );
}
__TSX__

# -----------------------------------------------------------------------------
# 6. project media (new interaction system)
# -----------------------------------------------------------------------------
info "Writing project interactions"

put src/styles/project-media.css <<'__CSS__'
/* Project media interactions. Each block belongs to one interaction id. */
.pm-chip {
    position: absolute; z-index: 10; left: 0.75rem; top: 0.75rem;
    border: 1px solid var(--border); border-radius: 999px;
    background: var(--background); padding: 0.25rem 0.75rem;
    font: 500 0.75rem/1.2 var(--font-mono), ui-monospace, monospace;
    color: color-mix(in oklab, var(--foreground) 80%, transparent);
    pointer-events: none;
}

/* conversation: a live thread slides over the screenshots */
.pm-thread {
    position: absolute; z-index: 5; left: 5%; right: 5%; bottom: 7%;
    display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none;
}
.pm-bubble {
    display: flex; align-items: center; gap: 0.35rem; max-width: 42%;
    padding: 0.6rem 0.8rem; border: 1px solid var(--border); border-radius: 1rem;
    background: color-mix(in oklab, var(--background) 90%, transparent);
    backdrop-filter: blur(6px);
    opacity: 0; transform: translateY(14px) scale(0.96);
    transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.pm-in { align-self: flex-start; border-bottom-left-radius: 0.3rem; }
.pm-out {
    align-self: flex-end; border-bottom-right-radius: 0.3rem;
    background: color-mix(in oklab, var(--tint) 30%, var(--background));
}
[data-on="true"] .pm-bubble { opacity: 1; transform: none; }
[data-on="true"] .pm-bubble:nth-child(2) { transition-delay: 0.15s; }
[data-on="true"] .pm-bubble:nth-child(3) { transition-delay: 0.3s; }
.pm-dot {
    display: block; width: 0.4rem; height: 0.4rem; border-radius: 99px;
    background: var(--foreground); opacity: 0.5;
}
[data-on="true"] .pm-dot { animation: pm-bounce 1s ease-in-out infinite; }
[data-on="true"] .pm-dot:nth-child(2) { animation-delay: 0.15s; }
[data-on="true"] .pm-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes pm-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-3px); opacity: 1; }
}
.pm-line {
    display: block; height: 0.45rem; border-radius: 99px;
    background: color-mix(in oklab, var(--foreground) 35%, transparent);
}
.pm-pips { position: absolute; z-index: 10; right: 0.75rem; top: 0.75rem; display: flex; gap: 0.3rem; pointer-events: none; }
.pm-pip {
    width: 0.4rem; height: 0.4rem; border-radius: 99px;
    background: color-mix(in oklab, var(--foreground) 30%, transparent);
    transition: width 0.3s ease, background-color 0.3s ease;
}
.pm-pip[data-current="true"] { width: 1rem; background: var(--tint); }

/* filmstrip: a sheen, then thumbnails rise from the bottom */
.pm-sheen {
    position: absolute; inset: 0; z-index: 4; pointer-events: none;
    background: linear-gradient(115deg, transparent 35%, color-mix(in oklab, white 22%, transparent) 50%, transparent 65%);
    transform: translateX(-120%);
    transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.pm-film:hover .pm-sheen { transform: translateX(120%); }
.pm-strip {
    position: absolute; z-index: 6; left: 0.75rem; right: 0.75rem; bottom: 0.75rem;
    display: flex; gap: 0.5rem; overflow-x: auto; list-style: none; margin: 0; padding: 0.4rem;
    border: 1px solid var(--border); border-radius: 0.75rem;
    background: color-mix(in oklab, var(--background) 88%, transparent);
    backdrop-filter: blur(8px);
    opacity: 0; transform: translateY(12px);
    transition: opacity 0.35s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.pm-film:hover .pm-strip, .pm-film:focus-within .pm-strip { opacity: 1; transform: none; }
.pm-thumb {
    display: block; height: 2.75rem; overflow: hidden; border-radius: 0.4rem;
    border: 2px solid transparent; opacity: 0.7; cursor: pointer;
    transition: opacity 0.2s ease, border-color 0.2s ease;
}
.pm-thumb:hover, .pm-thumb:focus-visible { opacity: 1; }
.pm-thumb:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.pm-thumb[aria-pressed="true"] { border-color: var(--tint); opacity: 1; }
.pm-thumb img { display: block; height: 100%; width: auto; aspect-ratio: 16 / 8; object-fit: cover; }
@media (hover: none) {
    .pm-strip { opacity: 1; transform: none; }
}

/* layers: back sheets fan out */
.pm-stack { padding: 12% 10% 0 0; }
.pm-stack-inner { position: relative; }
.pm-layer-back {
    position: absolute; inset: 0; overflow: hidden; border-radius: 6px;
    border: 1px solid var(--border);
    background: color-mix(in oklab, var(--tint) 16%, var(--background));
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.pm-layer-back img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.55; }
.pm-layer-1 { transform: translate(2.5%, -4%) scale(0.98); z-index: 2; }
.pm-layer-2 { transform: translate(5%, -8%) scale(0.96); z-index: 1; }
.pm-layer-0 { position: relative; z-index: 3; }
@media (prefers-reduced-motion: no-preference) {
    .pm-stack:hover .pm-layer-1 { transform: translate(5%, -8%) rotate(1deg); }
    .pm-stack:hover .pm-layer-2 { transform: translate(10%, -15%) rotate(2deg); }
}

@media (prefers-reduced-motion: reduce) {
    .pm-bubble, .pm-strip, .pm-pip, .pm-layer-back, .pm-thumb { transition: none; }
    [data-on="true"] .pm-dot { animation: none; }
    .pm-sheen { display: none; }
}
__CSS__

put src/components/section/project/media/parts.tsx <<'__TSX__'
/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import type { Project, Screenshot } from "@/types/portfolio";

export type InteractionProps = {
    project: Project;
    shots: Screenshot[];
    reduce: boolean;
};

export const ratioOf = (s?: Screenshot) => (s?.width && s?.height ? s.width / s.height : 1.6);

export function Shot({
    shot,
    eager,
    decorative,
    className = "",
}: {
    shot: Screenshot;
    eager?: boolean;
    decorative?: boolean;
    className?: string;
}) {
    return (
        <img
            src={shot.src}
            alt={decorative ? "" : shot.alt}
            aria-hidden={decorative || undefined}
            width={shot.width}
            height={shot.height}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className={className}
        />
    );
}

export function Frame({ ratio, children, className = "" }: { ratio: number; children: ReactNode; className?: string }) {
    return (
        <div
            style={{ aspectRatio: ratio }}
            className={`relative block w-full overflow-hidden rounded-[6px] border border-border bg-[color-mix(in_oklab,var(--tint)_12%,var(--background))] shadow-[0_30px_70px_-34px_rgba(0,0,0,0.6)] ${className}`}
        >
            {children}
        </div>
    );
}

export function Missing({ name }: { name: string }) {
    return (
        <span className="grid aspect-[16/10] w-full place-items-center rounded-[6px] border border-dashed border-border text-sm text-muted-foreground">
            {name}: screenshot unavailable
        </span>
    );
}
__TSX__

put src/components/section/project/media/Conversation.tsx <<'__TSX__'
"use client";

import { useEffect, useRef, useState } from "react";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "conversation": a live message thread. Hover (or tap) and chat bubbles
 * slide in while the screenshots advance like a running conversation.
 */
export default function Conversation({ project, shots, reduce }: InteractionProps) {
    const [on, setOn] = useState(false);
    const [i, setI] = useState(0);
    const touch = useRef(false);

    useEffect(() => {
        if (!on || reduce || shots.length < 2) return;
        const t = window.setInterval(() => setI((v) => (v + 1) % shots.length), 1800);
        return () => window.clearInterval(t);
    }, [on, reduce, shots.length]);

    const close = () => {
        setOn(false);
        setI(0);
    };

    return (
        <button
            type="button"
            data-on={on}
            aria-pressed={on}
            aria-label={`${project.name} screenshots. Toggle the live preview`}
            onPointerDown={(e) => {
                touch.current = e.pointerType !== "mouse";
            }}
            onPointerEnter={(e) => e.pointerType === "mouse" && setOn(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && close()}
            onBlur={close}
            onClick={(e) => {
                if (touch.current || e.detail === 0) (on ? close : () => setOn(true))();
            }}
            className="group block w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <Frame ratio={ratioOf(shots[0])}>
                {shots.map((s, k) => (
                    <Shot
                        key={s.src}
                        shot={s}
                        eager={k === 0}
                        decorative={k !== 0}
                        className={`absolute inset-0 size-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
                            k === i ? "opacity-100" : "opacity-0"
                        }`}
                    />
                ))}

                <span aria-hidden className="pm-thread">
                    <span className="pm-bubble pm-in">
                        <i className="pm-dot" />
                        <i className="pm-dot" />
                        <i className="pm-dot" />
                    </span>
                    <span className="pm-bubble pm-out">
                        <i className="pm-line" style={{ width: "6rem" }} />
                        <i className="pm-line" style={{ width: "3.5rem" }} />
                    </span>
                    <span className="pm-bubble pm-in">
                        <i className="pm-line" style={{ width: "5rem" }} />
                    </span>
                </span>

                {shots.length > 1 && (
                    <span aria-hidden className="pm-pips">
                        {shots.map((s, k) => (
                            <i key={s.src} className="pm-pip" data-current={k === i} />
                        ))}
                    </span>
                )}
                <span className="pm-chip">{on ? "live preview" : (project.readout ?? "hover or tap to preview")}</span>
            </Frame>
        </button>
    );
}
__TSX__

put src/components/section/project/media/Depth.tsx <<'__TSX__'
"use client";

import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { clamp01 } from "@/lib/utils";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "depth": layers that move at different speeds under the cursor, with a
 * soft light that follows it. No tilt, no rotation. Touch gets a still image.
 */
export default function Depth({ project, shots, reduce }: InteractionProps) {
    const px = useMotionValue(0);
    const py = useMotionValue(0);
    const sx = useSpring(px, { stiffness: 120, damping: 20 });
    const sy = useSpring(py, { stiffness: 120, damping: 20 });
    const x = useTransform(sx, [-0.5, 0.5], [12, -12]);
    const y = useTransform(sy, [-0.5, 0.5], [8, -8]);
    const x2 = useTransform(sx, [-0.5, 0.5], [-22, 22]);
    const y2 = useTransform(sy, [-0.5, 0.5], [-14, 14]);
    const lx = useTransform(sx, [-0.5, 0.5], [0, 100]);
    const ly = useTransform(sy, [-0.5, 0.5], [0, 100]);
    const light = useMotionTemplate`radial-gradient(circle at ${lx}% ${ly}%, color-mix(in oklab, var(--tint) 30%, transparent), transparent 55%)`;
    const [hot, setHot] = useState(false);
    const inset = shots[1];

    return (
        <div
            onPointerEnter={(e) => e.pointerType === "mouse" && !reduce && setHot(true)}
            onPointerMove={(e) => {
                if (e.pointerType !== "mouse" || reduce) return;
                const r = e.currentTarget.getBoundingClientRect();
                px.set(clamp01((e.clientX - r.left) / r.width) - 0.5);
                py.set(clamp01((e.clientY - r.top) / r.height) - 0.5);
            }}
            onPointerLeave={() => {
                setHot(false);
                px.set(0);
                py.set(0);
            }}
        >
            <Frame ratio={ratioOf(shots[0])}>
                <motion.div
                    style={reduce ? undefined : { x, y }}
                    animate={{ scale: hot ? 1.07 : 1 }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                    className="absolute inset-0"
                >
                    <Shot shot={shots[0]} eager className="size-full object-cover" />
                </motion.div>

                {inset && (
                    <motion.div
                        aria-hidden
                        style={reduce ? undefined : { x: x2, y: y2 }}
                        className="absolute bottom-[6%] right-[5%] w-[38%] overflow-hidden rounded-[5px] border border-border shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)]"
                    >
                        <Shot shot={inset} decorative className="block h-auto w-full" />
                    </motion.div>
                )}

                <motion.span
                    aria-hidden
                    style={{ background: light, opacity: hot ? 1 : 0 }}
                    className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-300"
                />
                <span className="pm-chip">{project.readout ?? "move over it"}</span>
            </Frame>
        </div>
    );
}
__TSX__

put src/components/section/project/media/Filmstrip.tsx <<'__TSX__'
"use client";

import { useState } from "react";
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "filmstrip": a light sweep crosses the frame and a strip of thumbnails
 * rises from the bottom. Hover or focus a thumbnail to swap the screenshot.
 */
export default function Filmstrip({ project, shots }: InteractionProps) {
    const [i, setI] = useState(0);

    return (
        <div className="pm-film">
            <Frame ratio={ratioOf(shots[0])}>
                {shots.map((s, k) => (
                    <Shot
                        key={s.src}
                        shot={s}
                        eager={k === 0}
                        decorative={k !== i}
                        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none ${
                            k === i ? "opacity-100" : "opacity-0"
                        }`}
                    />
                ))}
                <span aria-hidden className="pm-sheen" />

                {shots.length > 1 && (
                    <ul className="pm-strip" aria-label={`${project.name} screenshots`}>
                        {shots.map((s, k) => (
                            <li key={s.src} className="shrink-0">
                                <button
                                    type="button"
                                    className="pm-thumb"
                                    aria-pressed={k === i}
                                    aria-label={`Show screenshot ${k + 1} of ${shots.length}`}
                                    onClick={() => setI(k)}
                                    onFocus={() => setI(k)}
                                    onPointerEnter={(e) => e.pointerType === "mouse" && setI(k)}
                                >
                                    <Shot shot={s} decorative />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Frame>
        </div>
    );
}
__TSX__

put src/components/section/project/media/Layers.tsx <<'__TSX__'
import { Frame, Shot, ratioOf, type InteractionProps } from "./parts";

/*
 * "layers": the main screenshot sits on top of two sheets that fan out on
 * hover. Extra screenshots appear on the sheets. Works with a single image.
 */
export default function Layers({ project, shots }: InteractionProps) {
    const back = [shots[1], shots[2]];

    return (
        <div className="pm-stack">
            <div className="pm-stack-inner">
                {back.map((s, k) => (
                    <span key={k} aria-hidden className={`pm-layer-back ${k === 0 ? "pm-layer-1" : "pm-layer-2"}`}>
                        {s && <Shot shot={s} decorative />}
                    </span>
                ))}
                <div className="pm-layer-0">
                    <Frame ratio={ratioOf(shots[0])}>
                        <Shot shot={shots[0]} eager className="absolute inset-0 size-full object-cover" />
                        <span className="pm-chip">
                            {shots.length > 1 ? `${shots.length} screenshots` : (project.readout ?? "work in progress")}
                        </span>
                    </Frame>
                </div>
            </div>
        </div>
    );
}
__TSX__

put src/components/section/project/media/ProjectMedia.tsx <<'__TSX__'
"use client";

import type { ComponentType } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Project } from "@/types/portfolio";
import Conversation from "./Conversation";
import Depth from "./Depth";
import Filmstrip from "./Filmstrip";
import Layers from "./Layers";
import { Missing, type InteractionProps } from "./parts";

/** Interaction ids a project may name in Project.json: presentation.interaction. */
export const INTERACTIONS: Record<string, ComponentType<InteractionProps>> = {
    conversation: Conversation,
    depth: Depth,
    filmstrip: Filmstrip,
    layers: Layers,
};

type Props = {
    project: Project;
    /** 0 -> 1 while this stage rises into place */
    enter: MotionValue<number>;
    /** 0 -> 1 while the next stage covers this one */
    exit: MotionValue<number>;
    /** desktop + motion allowed: scroll-driven transforms apply */
    live: boolean;
    reduce: boolean;
};

/**
 * One component for every project. It reads the shared schema and picks the
 * hover interaction named in the data. No project ids appear here.
 */
export default function ProjectMedia({ project, enter, exit, live, reduce }: Props) {
    const x = useTransform(enter, [0, 1], ["10%", "0%"]);
    const o = useTransform(enter, [0, 0.6], [0, 1]);
    const lift = useTransform(exit, [0, 1], [0, -14]);
    const shots = project.screenshots;

    if (shots.length === 0) return <Missing name={project.name} />;
    const Impl = INTERACTIONS[project.interaction] ?? Filmstrip;

    return (
        <motion.div style={live ? { x, opacity: o, y: lift } : undefined}>
            <Impl project={project} shots={shots} reduce={reduce} />
        </motion.div>
    );
}
__TSX__

# -----------------------------------------------------------------------------
# 7. sections
# -----------------------------------------------------------------------------
info "Writing Hero, Experience, Contact, Footer, case study"

put src/components/section/hero/Hero.tsx <<'__TSX__'
"use client";
/* redesign:v2 */

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import HeroTray from "@/components/ui/Herotray";
import NightSky from "@/components/hero/NightSky";
import Eyebrow from "@/components/ui/Eyebrow";
import PlayButton from "@/components/ui/PlayButton";
import { portfolio } from "@/content/data";
import { TINT_LIST as TINTS } from "@/lib/tokens";

const hero = portfolio.hero;
const EASE = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Name                                                                      */
/*  Each word has a fixed clip box, so nothing is ever clipped late or        */
/*  shifted. Size scales with the viewport, capped at 7.5rem.                 */
/* -------------------------------------------------------------------------- */

const nameV: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const wordV: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
};
const letterV: Variants = {
    hidden: { y: "105%", opacity: 0 },
    show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

function AnimatedName({ first, last, label }: { first: string; last: string; label: string }) {
    let n = 0;
    return (
        <motion.h1
            aria-label={label}
            initial="hidden"
            animate="show"
            variants={nameV}
            className="flex flex-wrap justify-center gap-x-[0.24em] text-[clamp(2.75rem,11.5vw,7.5rem)] font-semibold leading-[1.04] tracking-[-0.03em]"
        >
            {[first, last].filter(Boolean).map((word, wi, all) => (
                <motion.span
                    key={word + wi}
                    aria-hidden
                    variants={wordV}
                    className="inline-flex overflow-hidden whitespace-nowrap pb-[0.16em] -mb-[0.16em]"
                >
                    {word.split("").map((ch) => {
                        const tint = TINTS[n++ % TINTS.length];
                        return (
                            <motion.span
                                key={n}
                                variants={letterV}
                                style={{ "--c": tint } as CSSProperties}
                                className="inline-block cursor-default transition-colors duration-300 hover:text-[color:var(--c)]"
                            >
                                {ch}
                            </motion.span>
                        );
                    })}
                    {wi === all.length - 1 && (
                        <motion.span variants={letterV} className="inline-block text-primary">
                            .
                        </motion.span>
                    )}
                </motion.span>
            ))}
        </motion.h1>
    );
}

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
});

/* -------------------------------------------------------------------------- */
/*  Rotating word                                                             */
/* -------------------------------------------------------------------------- */

function Rotator({ words, reduce }: { words: string[]; reduce: boolean }) {
    const [i, setI] = useState(0);

    useEffect(() => {
        if (reduce || words.length < 2) return;
        const t = window.setInterval(() => setI((v) => (v + 1) % words.length), 2200);
        return () => window.clearInterval(t);
    }, [reduce, words.length]);

    const tint = TINTS[i % TINTS.length];
    const mark = `linear-gradient(color-mix(in oklab, ${tint} 40%, transparent), color-mix(in oklab, ${tint} 40%, transparent))`;

    return (
        <span
            className="inline-block overflow-hidden align-bottom text-foreground"
            style={{
                backgroundImage: mark,
                backgroundSize: "100% 38%",
                backgroundPosition: "0 88%",
                backgroundRepeat: "no-repeat",
                transition: "background-image 0.4s",
            }}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={words[i]}
                    initial={reduce ? false : { y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    className="inline-block"
                >
                    {words[i]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/*  Sticker chips                                                             */
/* -------------------------------------------------------------------------- */

function Stickers({ items, reduce }: { items: { label: string; tilt?: number }[]; reduce: boolean }) {
    if (items.length === 0) return null;
    return (
        <ul className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {items.map((s, i) => (
                <motion.li
                    key={s.label}
                    data-sticker
                    drag={!reduce}
                    dragSnapToOrigin
                    dragElastic={0.5}
                    dragMomentum={false}
                    initial={reduce ? false : { opacity: 0, scale: 0.5, y: 20, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: s.tilt ?? 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 17, delay: reduce ? 0 : 1.35 + i * 0.08 }}
                    whileHover={reduce ? undefined : { y: -4, scale: 1.06 }}
                    whileTap={reduce ? undefined : { scale: 0.95 }}
                    whileDrag={{ scale: 1.1, zIndex: 20 }}
                    style={{ "--tint": TINTS[i % TINTS.length] } as CSSProperties}
                    className="inline-flex cursor-grab touch-none select-none items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--tint)_40%,transparent)] bg-[color-mix(in_oklab,var(--tint)_10%,var(--background))] px-3.5 py-1.5 text-xs font-medium active:cursor-grabbing sm:text-sm"
                >
                    <span className="size-1.5 rounded-full bg-[color:var(--tint)]" />
                    {s.label}
                </motion.li>
            ))}
        </ul>
    );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/*  Nothing here reacts to page scroll: the content stays where it is.        */
/* -------------------------------------------------------------------------- */

export default function Hero() {
    const reduce = !!useReducedMotion();
    const words = hero.rotatorWords?.length ? hero.rotatorWords : ["products"];
    const first = hero.firstName;
    const last = hero.secondName ?? hero.fullName.split(" ").slice(1).join(" ");
    const intro = hero.intro;

    return (
        <section id="home" className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-background px-4 sm:px-6">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--primary)_0%,transparent_45%)] opacity-[0.07]" />
                <div className="absolute -left-1/4 top-[30%] h-56 w-[150%] rotate-[-18deg] bg-[radial-gradient(ellipse_at_center,var(--foreground)_0%,transparent_65%)] opacity-[0.035] blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[64px_64px] opacity-[0.14] mask-[linear-gradient(to_bottom,black,transparent_75%)]" />
                <NightSky />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_50%,var(--background)_0%,transparent_100%)] opacity-70" />
            </div>

            <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center pb-24 pt-24 text-center sm:pt-28">
                {hero.eyebrow && (
                    <motion.div {...fadeUp(0.1)} className="mb-6">
                        <Eyebrow>{hero.eyebrow}</Eyebrow>
                    </motion.div>
                )}

                {hero.greeting && (
                    <motion.p {...fadeUp(0.2)} className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground sm:text-sm">
                        {hero.greeting}
                        <motion.span
                            aria-hidden
                            className="ml-2 inline-block origin-[70%_70%]"
                            animate={reduce ? undefined : { rotate: [0, 14, -8, 14, -4, 10, 0] }}
                            transition={{ duration: 1.8, delay: 1.4, repeat: Infinity, repeatDelay: 3.5 }}
                        >
                            👋
                        </motion.span>
                    </motion.p>
                )}

                <AnimatedName first={first} last={last} label={hero.fullName} />

                {hero.role && (
                    <motion.h2 {...fadeUp(1.0)} className="mt-6 text-lg font-medium tracking-tight sm:mt-8 sm:text-xl md:text-2xl">
                        {hero.role.before} <span className="text-primary">{hero.role.highlight}</span>
                    </motion.h2>
                )}

                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 1.1, delay: 1.15, ease: EASE }}
                    className="mt-6 h-px w-40 origin-center bg-linear-to-r from-transparent via-primary to-transparent"
                />

                {intro && (
                    <motion.p {...fadeUp(1.25)} className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg md:text-xl">
                        {intro.before} <span className="text-foreground">{intro.emphasis}</span> {intro.middle}{" "}
                        <Rotator words={words} reduce={reduce} /> {intro.after}
                    </motion.p>
                )}

                <Stickers items={hero.stickers ?? []} reduce={reduce} />

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {hero.primaryCta && (
                        <PlayButton href={hero.primaryCta.href} variant="solid">
                            {hero.primaryCta.label}
                        </PlayButton>
                    )}
                    {hero.secondaryCta && <PlayButton href={hero.secondaryCta.href}>{hero.secondaryCta.label}</PlayButton>}
                </div>

                <div className="mt-8 flex w-full justify-center sm:mt-10 sm:w-auto">
                    <HeroTray delay={1.6} />
                </div>
            </div>

            <motion.a
                href="#about"
                aria-label="Scroll to next section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4, duration: 1 }}
                className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-muted-foreground transition-colors hover:text-primary sm:block"
            >
                <motion.span
                    animate={reduce ? undefined : { y: [0, 8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="block"
                >
                    <HugeiconsIcon icon={ArrowDown01Icon} size={26} strokeWidth={1.8} />
                </motion.span>
            </motion.a>
        </section>
    );
}
__TSX__

put src/components/section/experience/Experience.tsx <<'__TSX__'
"use client";
/* redesign:v2 */

import { useReducedMotion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import AnimatedLink from "@/components/ui/AnimatedLink";
import SectionHeader from "@/components/ui/SectionHeader";
import { copy, education, experience, writing } from "@/content/experience";
import type { ExperienceEntry } from "@/types/portfolio";

const LABEL = "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground";

function Entry({ job }: { job: ExperienceEntry }) {
    return (
        <li className="relative">
            <span
                aria-hidden
                className="absolute -left-[1.9rem] top-1.5 size-3 rounded-full border-2 border-primary bg-background sm:-left-[2.4rem]"
            />
            <Reveal className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] md:gap-10">
                <div>
                    <p className={LABEL}>{job.period}</p>
                    <p className="ds-serif mt-2 text-2xl italic text-primary">{job.org}</p>
                    {job.location && <p className="mt-1 text-sm text-muted-foreground">{job.location}</p>}
                </div>

                <div className="flex min-w-0 flex-col gap-5">
                    <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{job.role}</h3>
                    {job.summary && <p className="max-w-[62ch] text-base leading-7 text-muted-foreground">{job.summary}</p>}

                    {job.points && job.points.length > 0 && (
                        <ul className="flex flex-col gap-3">
                            {job.points.map((p) => (
                                <li key={p} className="flex gap-3 text-[15px] leading-7">
                                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                                    <span>{p}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {job.stack && job.stack.length > 0 && (
                        <ul aria-label="Technologies" className="flex flex-wrap gap-1.5">
                            {job.stack.map((s) => (
                                <li key={s} className="inline-flex h-7 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground/80">
                                    {s}
                                </li>
                            ))}
                        </ul>
                    )}

                    {job.link && (
                        <p className="text-sm font-medium">
                            <AnimatedLink href={job.link.href}>{job.link.label}</AnimatedLink>
                        </p>
                    )}
                </div>
            </Reveal>
        </li>
    );
}

export default function Experience() {
    const reduce = !!useReducedMotion();

    return (
        <section id="experience" className="relative border-t border-border bg-background px-4 py-20 sm:px-6 lg:py-28">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:gap-16">
                <SectionHeader index={copy.index} label={copy.badge} top={copy.headingTop} bottom={copy.headingBottom} reduce={reduce} />

                <ol className="relative flex flex-col gap-14 border-l border-border pl-6 sm:pl-8 lg:gap-16">
                    {experience.map((job) => (
                        <Entry key={job.role + job.org + job.period} job={job} />
                    ))}
                </ol>

                {(education.length > 0 || writing.length > 0) && (
                    <div className="grid gap-10 border-t border-border pt-10 md:grid-cols-2 md:gap-14">
                        {education.length > 0 && (
                            <Reveal>
                                <p className={LABEL}>{copy.educationLabel}</p>
                                <ul className="mt-3 flex flex-col gap-6">
                                    {education.map((e) => (
                                        <li key={e.degree + e.school}>
                                            <h3 className="ds-serif text-3xl italic leading-tight sm:text-4xl">{e.degree}</h3>
                                            <p className="mt-2 text-base text-muted-foreground">
                                                {e.school}
                                                {e.year ? ` · ${e.year}` : ""}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        )}

                        {writing.length > 0 && (
                            <Reveal delay={0.1}>
                                <p className={LABEL}>{copy.writingLabel}</p>
                                <ul className="mt-3 flex flex-col gap-5">
                                    {writing.map((w) => (
                                        <li key={w.href}>
                                            <AnimatedLink href={w.href} className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                                                {w.title}
                                            </AnimatedLink>
                                            {w.source && <p className="mt-1 text-sm text-muted-foreground">{w.source}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
__TSX__

put src/components/section/contact/contact.tsx <<'__TSX__'
"use client";
/* redesign:v2 */

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AnimatedLink from "@/components/ui/AnimatedLink";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Headline from "@/components/ui/Headline";
import Screen from "@/components/ui/Screen";
import { portfolio } from "@/content/data";
import { site } from "@/content/site";
import { fade, spring, stackLoose, viewportOnce } from "@/lib/motion";

const c = portfolio.sections.contact;
const TOPICS = c.topics?.length ? c.topics : [{ id: "hi", label: "Hello" }];

type Status = "idle" | "sending" | "sent" | "error";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MAX_MESSAGE = 1200;
const ERR = "text-[oklch(0.62_0.2_25)]";
const LABEL = "text-sm font-medium";
const FIELD =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-foreground/40 focus:border-foreground focus-visible:ring-2 focus-visible:ring-primary/40 aria-[invalid=true]:border-[oklch(0.62_0.2_25)]";

function CopyEmail() {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(site.email);
        } catch {
            /* clipboard blocked: the mailto link still works */
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    }

    return (
        <Button onClick={copy} variant="outline">
            <span aria-live="polite">{copied ? (c.copiedLabel ?? "Copied") : (c.copyLabel ?? "Copy email")}</span>
        </Button>
    );
}

export default function Contact() {
    const reduce = !!useReducedMotion();

    const [topicId, setTopicId] = useState(TOPICS[0].id);
    const [name, setName] = useState("");
    const [from, setFrom] = useState("");
    const [message, setMessage] = useState("");
    const [trap, setTrap] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [showErrors, setShowErrors] = useState(false);

    const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];

    const errors = {
        name: name.trim().length < 2 ? "What should I call you?" : "",
        email: EMAIL_RE.test(from.trim()) ? "" : "That email looks a bit off",
        message: message.trim().length < 10 ? "A few more words, please" : "",
    };
    const valid = !errors.name && !errors.email && !errors.message;
    const shown = (key: keyof typeof errors) => (showErrors ? errors[key] : "");

    const mailto = () => {
        const subject = encodeURIComponent(topic.label);
        const body = encodeURIComponent(`${message}\n\n${name} (${from})`);
        return `mailto:${site.email}?subject=${subject}&body=${body}`;
    };

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setShowErrors(true);
        if (!valid || status === "sending") return;
        setStatus("sending");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mood: topic.id,
                    name: name.trim(),
                    email: from.trim(),
                    message: message.trim(),
                    website: trap,
                }),
            });
            if (!res.ok) throw new Error(String(res.status));
            setStatus("sent");
        } catch {
            setStatus("error");
        }
    }

    function reset() {
        setName("");
        setFrom("");
        setMessage("");
        setTrap("");
        setShowErrors(false);
        setStatus("idle");
    }

    return (
        <Screen id="contact">
            <div className="mx-auto grid w-full max-w-6xl flex-1 content-center gap-12 px-4 pb-16 pt-[clamp(4.5rem,11vh,6.5rem)] sm:px-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16">
                {/* ---------- left: the ask ---------- */}
                <motion.div
                    initial={reduce ? "show" : "hidden"}
                    whileInView="show"
                    viewport={viewportOnce}
                    variants={stackLoose}
                    className="flex flex-col items-start gap-[clamp(0.9rem,2.6vh,1.5rem)]"
                >
                    <motion.div variants={fade}>
                        <Eyebrow index={c.index}>{c.badge}</Eyebrow>
                    </motion.div>

                    <Headline reduce={reduce} size="xl" toptext={c.headingTop} bottomtext={c.headingBottom} />

                    <motion.p variants={fade} className="max-w-md text-base leading-7 text-muted-foreground">
                        {c.intro}
                    </motion.p>

                    <motion.div variants={fade} className="flex flex-wrap items-center gap-3">
                        <Button href={`mailto:${site.email}`} variant="solid">
                            {c.primaryCta}
                        </Button>
                        <CopyEmail />
                    </motion.div>

                    <motion.dl variants={fade} className="grid w-full max-w-md gap-4 border-t border-border pt-6 text-sm">
                        <div className="flex items-baseline justify-between gap-4">
                            <dt className="text-muted-foreground">Email</dt>
                            <dd className="min-w-0 break-all text-right font-medium">
                                <AnimatedLink href={`mailto:${site.email}`}>{site.email}</AnimatedLink>
                            </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                            <dt className="text-muted-foreground">Based in</dt>
                            <dd className="text-right font-medium">{site.location}</dd>
                        </div>
                        {c.replyTime && (
                            <div className="flex items-baseline justify-between gap-4">
                                <dt className="text-muted-foreground">Replies</dt>
                                <dd className="text-right font-medium">{c.replyTime}</dd>
                            </div>
                        )}
                        <div className="flex items-baseline justify-between gap-4">
                            <dt className="text-muted-foreground">Elsewhere</dt>
                            <dd>
                                <ul className="flex flex-wrap justify-end gap-x-5 gap-y-1 font-medium">
                                    {site.social.map((l) => (
                                        <li key={l.label}>
                                            <AnimatedLink href={l.href}>{l.label}</AnimatedLink>
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </div>
                    </motion.dl>
                </motion.div>

                {/* ---------- right: the form ---------- */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ ...spring, delay: 0.08 }}
                    className="w-full"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {status === "sent" ? (
                            <motion.div
                                key="sent"
                                initial={reduce ? false : { opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex min-h-[22rem] flex-col items-start justify-center gap-4 rounded-3xl border border-border bg-muted/30 p-8"
                            >
                                <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
                                    <svg viewBox="0 0 16 16" aria-hidden className="size-5">
                                        <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <h3 className="text-2xl font-semibold tracking-tight">{c.successTitle}</h3>
                                <p className="max-w-sm text-base leading-7 text-muted-foreground">
                                    {name.trim().split(" ")[0] ? `${name.trim().split(" ")[0]}, ` : ""}
                                    {c.successText}
                                </p>
                                <Button onClick={reset} variant="outline" size="sm">
                                    Send another
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                noValidate
                                onSubmit={onSubmit}
                                exit={{ opacity: 0 }}
                                className="relative flex flex-col gap-5 rounded-3xl border border-border bg-muted/30 p-5 sm:p-8"
                            >
                                <h3 className="text-xl font-semibold tracking-tight">{c.formTitle}</h3>

                                <fieldset className="min-w-0">
                                    <legend className={`${LABEL} mb-2`}>{c.topicsLabel}</legend>
                                    <div className="flex flex-wrap gap-2">
                                        {TOPICS.map((t) => {
                                            const on = t.id === topicId;
                                            return (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    aria-pressed={on}
                                                    onClick={() => setTopicId(t.id)}
                                                    className={`h-9 rounded-full border px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                                        on
                                                            ? "border-foreground bg-foreground text-background"
                                                            : "border-border text-foreground/80 hover:border-foreground"
                                                    }`}
                                                >
                                                    {t.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </fieldset>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="c-name" className={LABEL}>Name</label>
                                        <input
                                            id="c-name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ada Lovelace"
                                            autoComplete="name"
                                            maxLength={100}
                                            aria-invalid={!!shown("name")}
                                            aria-describedby={shown("name") ? "c-name-error" : undefined}
                                            className={FIELD}
                                        />
                                        {shown("name") && (
                                            <p id="c-name-error" role="alert" className={`text-xs ${ERR}`}>{shown("name")}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="c-email" className={LABEL}>Email</label>
                                        <input
                                            id="c-email"
                                            type="email"
                                            value={from}
                                            onChange={(e) => setFrom(e.target.value)}
                                            placeholder="ada@example.com"
                                            autoComplete="email"
                                            maxLength={200}
                                            aria-invalid={!!shown("email")}
                                            aria-describedby={shown("email") ? "c-email-error" : undefined}
                                            className={FIELD}
                                        />
                                        {shown("email") && (
                                            <p id="c-email-error" role="alert" className={`text-xs ${ERR}`}>{shown("email")}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="c-msg" className={LABEL}>Message</label>
                                    <textarea
                                        id="c-msg"
                                        rows={6}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell me a little about it..."
                                        maxLength={MAX_MESSAGE}
                                        aria-invalid={!!shown("message")}
                                        aria-describedby={shown("message") ? "c-msg-error" : undefined}
                                        className={`${FIELD} resize-none`}
                                    />
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-h-4">
                                            {shown("message") && (
                                                <p id="c-msg-error" role="alert" className={`text-xs ${ERR}`}>{shown("message")}</p>
                                            )}
                                        </div>
                                        <span className="text-xs tabular-nums text-muted-foreground">
                                            {message.length}/{MAX_MESSAGE}
                                        </span>
                                    </div>
                                </div>

                                {/* Honeypot. People never see or fill this. */}
                                <input
                                    type="text"
                                    name="website"
                                    value={trap}
                                    onChange={(e) => setTrap(e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden
                                    className="absolute -left-[9999px] size-0 opacity-0"
                                />

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <Button type="submit" variant="solid" loading={status === "sending"}>
                                        {status === "sending" ? "Sending..." : c.submitLabel}
                                    </Button>
                                    {c.availability && <p className="text-sm text-muted-foreground">{c.availability}</p>}
                                </div>

                                {status === "error" && (
                                    <p role="alert" className="text-sm text-muted-foreground">
                                        That didn&apos;t go through, so your message is still here.{" "}
                                        <AnimatedLink href={mailto()} className="font-medium text-primary">
                                            Send it from your email app instead
                                        </AnimatedLink>
                                        .
                                    </p>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </Screen>
    );
}
__TSX__

put src/components/section/footer/Footer.tsx <<'__TSX__'
"use client";
/* redesign:v2 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import AnimatedLink from "@/components/ui/AnimatedLink";
import { portfolio } from "@/content/data";
import { site } from "@/content/site";

const LABEL = "font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground";
const f = portfolio.footer;

/** Local time, computed on the client so it never mismatches on hydration. */
function LocalClock() {
    const [time, setTime] = useState<string | null>(null);

    useEffect(() => {
        const fmt = () =>
            new Intl.DateTimeFormat("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: site.timezone,
            }).format(new Date());
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTime(fmt());
        const id = window.setInterval(() => setTime(fmt()), 15000);
        return () => window.clearInterval(id);
    }, []);

    return (
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {site.location} · <span className="tabular-nums">{time ?? "--:--"}</span>
        </p>
    );
}

export default function Footer() {
    const reduce = !!useReducedMotion();
    const year = new Date().getFullYear();

    function toTop() {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }

    return (
        <footer id="footer" className="w-full max-w-[100vw] overflow-x-clip border-t border-border bg-background px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
                <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)]">
                    <div className="flex flex-col gap-3">
                        <p className="text-2xl font-semibold tracking-tight">
                            {site.fullName}
                            <span className="text-primary">.</span>
                        </p>
                        {f.note && <p className="max-w-xs text-sm leading-6 text-muted-foreground">{f.note}</p>}
                        {f.availability && (
                            <span className="mt-1 inline-flex items-center gap-2.5 text-sm font-medium">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                                </span>
                                {f.availability}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className={LABEL}>Contact</p>
                        <p className="text-base font-medium [overflow-wrap:anywhere]">
                            <AnimatedLink href={`mailto:${site.email}`}>{site.email}</AnimatedLink>
                        </p>
                        <LocalClock />
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className={LABEL}>Elsewhere</p>
                        <ul className="flex flex-col gap-2 text-base">
                            {site.social.map((l) => (
                                <li key={l.label}>
                                    <AnimatedLink href={l.href} variant="nudge">
                                        {l.label}
                                    </AnimatedLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        © {year} {site.fullName}. {f.copyright ?? "All rights reserved."}
                    </p>
                    <button
                        type="button"
                        onClick={toTop}
                        className="lnk-lift w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        Back to top
                    </button>
                </div>
            </div>
        </footer>
    );
}
__TSX__

put "src/app/projects/[slug]/page.tsx" <<'__TSX__'
/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AnimatedLink from "@/components/ui/AnimatedLink";
import Eyebrow from "@/components/ui/Eyebrow";
import PlayButton from "@/components/ui/PlayButton";
import { RECORDS, STATUS } from "@/content/projects";

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(RECORDS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const s = RECORDS[slug];
    if (!s) return {};
    return {
        title: s.meta.projectName,
        description: s.executiveSummary.oneLiner,
        alternates: { canonical: `/projects/${slug}` },
    };
}

function List({ title, items }: { title: string; items?: string[] }) {
    if (!items || items.length === 0) return null;
    return (
        <section className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
                {items.map((i) => (
                    <li key={i} className="flex gap-3 text-base leading-7 text-foreground/85">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{i}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const s = RECORDS[slug];
    if (!s) notFound();
    const { meta, executiveSummary: e, roadmap } = s;
    const links = s.links ?? [];
    const shots = s.screenshots ?? [];

    const groups = new Map<string, string[]>();
    for (const t of s.technologies ?? []) {
        const key = t.category ?? "Other";
        groups.set(key, [...(groups.get(key) ?? []), t.name]);
    }

    return (
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
            <AnimatedLink href="/#projects" arrow={false} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                ← Back to projects
            </AnimatedLink>

            <div className="mt-6">
                <Eyebrow>{STATUS[meta.status] ? `Status: ${STATUS[meta.status].label}` : "Case study"}</Eyebrow>
            </div>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
                <span className="ds-serif text-primary">{meta.projectName}</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{e.oneLiner}</p>

            {links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                    {links.map((l, i) => (
                        <PlayButton key={l.href} href={l.href} variant={i === 0 ? "solid" : "outline"} external>
                            {l.label}
                        </PlayButton>
                    ))}
                </div>
            )}

            <section className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight">The problem</h2>
                <p className="mt-3 text-base leading-7 text-foreground/85">{e.problemStatement}</p>
            </section>
            <section className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tight">The solution</h2>
                <p className="mt-3 text-base leading-7 text-foreground/85">{e.solutionOverview}</p>
            </section>

            <List title="What it does" items={e.keyCapabilities} />
            <List title="Known limitations" items={e.knownLimitations} />

            {groups.size > 0 && (
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold tracking-tight">Built with</h2>
                    <dl className="mt-4 flex flex-col gap-4">
                        {[...groups.entries()].map(([cat, names]) => (
                            <div key={cat} className="grid gap-2 sm:grid-cols-[9rem_1fr]">
                                <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground sm:pt-1.5">{cat}</dt>
                                <dd>
                                    <ul className="flex flex-wrap gap-1.5">
                                        {names.map((n) => (
                                            <li key={n} className="inline-flex h-7 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground/80">
                                                {n}
                                            </li>
                                        ))}
                                    </ul>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {shots.length > 0 && (
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold tracking-tight">Screenshots</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {shots.map((shot) => (
                            <img
                                key={shot.src}
                                src={shot.src}
                                alt={shot.alt}
                                width={shot.width}
                                height={shot.height}
                                loading="lazy"
                                decoding="async"
                                className="h-auto w-full rounded-[var(--ds-radius-sm)] border border-border"
                            />
                        ))}
                    </div>
                </section>
            )}

            <List title="Next up" items={roadmap?.shortTerm} />
            <List title="Later" items={[...(roadmap?.midTerm ?? []), ...(roadmap?.longTerm ?? [])]} />
        </article>
    );
}
__TSX__

# -----------------------------------------------------------------------------
# 8. surgical patches to existing files
# -----------------------------------------------------------------------------
info "Patching existing files"
cat > "$TOOLS/patches.mjs" <<'__JS__'
import { patch, writeText, backup } from "./lib.mjs";
import fs from "node:fs";

// Project stage: use the shared media component. The sticky geometry is untouched.
patch("src/components/section/project/ProjectStage.tsx", [
  ['import { visualFor } from "./visuals";', 'import ProjectMedia from "./media/ProjectMedia";'],
  ["console.log(project);", ""],
  ["const Visual = visualFor(project.id);", ""],
  ["<Visual project={project} enter={enter} exit={exit} live={live} reduce={reduce} />",
   "<ProjectMedia project={project} enter={enter} exit={exit} live={live} reduce={reduce} />"],
]);

// Skills: layout adapts to any number of skills.
patch("src/components/section/skill/Skills.tsx", [
  [/className="(relative box-border flex min-h-svh w-full\s+flex-col[^"]*?)lg:h-svh([^"]*)"/,
   (_m, a, b) => `className={\`${a}\${FIXED ? "lg:h-svh" : "lg:min-h-svh"}${b}\`}`,
   'FIXED ? "lg:h-svh"'],
  [/className="grid grid-cols-4 gap-2 sm:gap-3 lg:h-full lg:grid-rows-4 lg:gap-4"/,
   () => 'className={`grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4 ${FIXED ? "lg:h-full lg:grid-rows-4" : ""}`}',
   'FIXED ? "lg:h-full lg:grid-rows-4"'],
  ["const tintOf = (skill: Skill) => CAT_BY_ID[skill.cat].tint;",
   "const tintOf = (skill: Skill) => CAT_BY_ID[skill.cat].tint;\n\n/* Up to four rows fit one screen. More skills let the section grow. */\nconst FIXED = SKILLS.length <= COLS * 4;",
   "const FIXED = SKILLS.length"],
  ["onSelect={pick}", "onSelect={pick}\n                                                fixedGrid={FIXED}", "fixedGrid={FIXED}"],
]);
patch("src/components/section/skill/SkillTile.tsx", [
  [/onSelect,\s*\}: \{/, () => "onSelect,\n    fixedGrid = true,\n}: {", "fixedGrid = true"],
  ["onSelect: (id: string) => void;", "onSelect: (id: string) => void;\n    fixedGrid?: boolean;", "fixedGrid?: boolean;"],
  ['className="relative aspect-square min-h-0 lg:aspect-auto"',
   'className={`relative aspect-square min-h-0 ${fixedGrid ? "lg:aspect-auto" : ""}`}',
   'fixedGrid ? "lg:aspect-auto"'],
]);

// Static text must not look clickable.
patch("src/components/ui/Marquee.tsx", [
  ['className="ds-eyebrow px-6 text-muted-foreground transition-colors hover:text-foreground"',
   'className="ds-eyebrow px-6 text-muted-foreground"'],
]);

// Load the new style files.
patch("src/app/layout.tsx", [
  ['import "@/styles/editorial.css";',
   'import "@/styles/editorial.css";\nimport "@/styles/links.css";\nimport "@/styles/project-media.css";',
   'import "@/styles/links.css";'],
]);

// Contact button was renamed.
patch("e2e/smoke.spec.ts", [["/post it/i", "/send message/i"]]);

// package.json: content validation script.
const pj = JSON.parse(fs.readFileSync("package.json", "utf8"));
pj.scripts ??= {};
if (!pj.scripts["validate:content"]) {
  pj.scripts["validate:content"] = "node scripts/validate-content.mjs";
  writeText("package.json", JSON.stringify(pj, null, 4) + "\n");
  console.log("  patched   package.json");
}
__JS__
node "$TOOLS/patches.mjs" || die "Patching failed"

if [ -f e2e/smoke.spec.ts ] && ! grep -q 'send message' e2e/smoke.spec.ts; then warn "e2e/smoke.spec.ts was not updated"; fi

# -----------------------------------------------------------------------------
# 9. validator and tests
# -----------------------------------------------------------------------------
info "Writing validator and tests"

put scripts/validate-content.mjs <<'__JS__'
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
__JS__

put e2e/content.spec.ts <<'__TS__'
import { expect, test } from "@playwright/test";

test("every project renders with the shared schema", async ({ page }) => {
    await page.goto("/");
    const stages = page.locator("#projects ol > li");
    await expect(stages).toHaveCount(4);
    for (const slug of ["hermes", "pokeverse", "calculate", "algoforge"]) {
        const res = await page.request.get(`/projects/${slug}`);
        expect(res.ok()).toBeTruthy();
    }
});

test("hero stays in place while scrolling", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1, name: "Raunak Yadav" });
    await expect(h1).toBeVisible();
    await page.waitForTimeout(2200);
    const docTop = () => h1.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const before = await docTop();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(400);
    expect(Math.abs((await docTop()) - before)).toBeLessThan(1);
});

test("project stages keep sticky positioning on desktop", async ({ page, isMobile }) => {
    test.skip(isMobile, "sticky stack is desktop only");
    await page.goto("/");
    const pos = await page
        .locator("#projects ol > li")
        .first()
        .locator("article")
        .evaluate((el) => getComputedStyle(el).position);
    expect(pos).toBe("sticky");
});

test("footer shows contact and copyright", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer#footer");
    await expect(footer.getByRole("link", { name: /@/ })).toBeVisible();
    await expect(footer).toContainText("©");
});
__TS__

# -----------------------------------------------------------------------------
# 10. removals and housekeeping
# -----------------------------------------------------------------------------
info "Removing replaced files"
remove_file src/components/section/project/visuals.tsx

if [ -f .gitignore ] && ! grep -q '^\.portfolio-backups' .gitignore; then
  bk .gitignore
  printf '\n# portfolio-refinement backups\n.portfolio-backups/\n' >> .gitignore
  ok "added .portfolio-backups/ to .gitignore"
fi

# the sticky stack must still be there
grep -q 'lg:sticky lg:top-0' src/components/section/project/ProjectStage.tsx || die "Sticky stage markup lost. Restoring."
grep -q 'lg:-mt-\[100svh\]' src/components/section/project/ProjectStage.tsx || die "Stage overlap markup lost. Restoring."
grep -q 'useScroll' src/components/section/hero/Hero.tsx && die "Hero still reads scroll. Restoring."
ok "Sticky snap-scroll markup intact, hero has no scroll movement"

# -----------------------------------------------------------------------------
# 11. validation
# -----------------------------------------------------------------------------
PHASE="validate"
export NEXT_TELEMETRY_DISABLED=1
info "Validating JSON content"
node scripts/validate-content.mjs

if [ "${SKIP_CHECKS:-0}" = "1" ]; then
  warn "SKIP_CHECKS=1: skipping install, typecheck, lint and build"
else
  if [ ! -d node_modules ]; then info "Installing dependencies with $PM"; "$PM" install; fi
  info "Typecheck";  "$PM" run typecheck
  info "Lint";       "$PM" run lint
  info "Build";      "$PM" run build
  if [ "${RUN_E2E:-0}" = "1" ]; then info "Playwright"; "$PM" run test:e2e; fi
fi

PHASE="done"
printf '\n%sDone.%s\n' "$c_ok" "$c_off"
cat <<EOF
 Backups:   ${BK#$ROOT/}
 Undo:      ./portfolio-refinement.sh --restore ${BK#$ROOT/}
 Add a skill:       edit src/Data/Data.json  ->  skills.skills
 Add experience:    edit src/Data/Data.json  ->  experience
 Add a project:     add a slug to src/Data/Project.json (copy an existing entry)
 Check content:     $PM run validate:content
EOF