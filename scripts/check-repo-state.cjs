// Vérifie l'état du repo distant après le push timeout.
const fs = require("fs");
const path = require("path");
const lines = fs.readFileSync(path.join(process.env.USERPROFILE, "Desktop", "deploy.txt"), "utf8").split(/\r?\n/);
const token = lines.find((l) => l.trim().startsWith("ghp_"))?.trim();
(async () => {
  const r = await fetch("https://api.github.com/repos/houseofbliss-nl/vapesale24", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  const info = await r.json();
  console.log("status:", r.status, "| default_branch:", info.default_branch);
  const c = await fetch("https://api.github.com/repos/houseofbliss-nl/vapesale24/commits?per_page=5", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  const txt = await c.text();
  console.log("commits status:", c.status);
  try {
    const arr = JSON.parse(txt);
    if (Array.isArray(arr)) {
      if (arr.length === 0) console.log("aucun commit — repo encore vide");
      else arr.forEach((x) => console.log(" ", x.sha.slice(0, 7), "|", x.commit.message.split("\n")[0].slice(0, 60)));
    } else {
      console.log("réponse non-array:", txt.slice(0, 300));
    }
  } catch (e) {
    console.log("erreur parsing:", e.message, "|", txt.slice(0, 300));
  }
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });