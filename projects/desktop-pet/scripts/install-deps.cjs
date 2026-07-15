const { spawnSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const electronMirror = process.env.ELECTRON_MIRROR || "https://npmmirror.com/mirrors/electron/";
const electronCache = process.env.ELECTRON_CACHE || path.join(projectRoot, ".npm-cache", "electron");

const result = spawnSync(npmCommand, ["ci"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    ELECTRON_MIRROR: electronMirror,
    ELECTRON_CACHE: electronCache
  },
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
