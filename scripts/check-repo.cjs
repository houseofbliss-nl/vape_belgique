// Vérifie le repo GitHub cible via API (sans afficher le token).
const fs = require("fs");
const path = require("path");
const deploy = path.join(process.env.USERPROFILE, "Desktop", "deploy.txt");
const lines = fs.readFileSync(deploy, "utf8").split(/\r?\n/);
const token = lines.find((l) => l.trim().startsWith("ghp_"))?.trim();
const repoUrl = lines.find((l) => l.includes("github.com") && l.endsWith(".git"))?.trim();
if (!token || !repoUrl) { console.error("Token ou URL repo introuvable dans deploy.txt"); process.exit(1); }
const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)\.git/);
if (!m) { console.error("URL repo invalide:", repoUrl); process.exit(1); }
const owner = m[1], name = m[2];
(async () => {
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) { console.error(`API ${res.status}: ${(await res.text()).slice(0, 300)}`); process.exit(1); }
  const r = await res.json();
  console.log(`repo: ${r.full_name} | default_branch=${r.default_branch} | private=${r.private} | size=${r.size}Ko`);
  // contenu racine
  const c = await fetch(`https://api.github.com/repos/${owner}/${name}/contents`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (c.ok) { const files = await c.json(); console.log("racine:", files.map((f) => f.name).join(", ")); }
  else console.log("racine: (vide ou err)", c.status);
})().catch((e) => { console.error(e); process.exit(1); });