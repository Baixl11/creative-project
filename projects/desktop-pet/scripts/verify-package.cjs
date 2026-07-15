const { spawnSync } = require("node:child_process");

if (process.platform !== "win32") {
  console.log("Skipping Windows package verification on this platform. Run npm.cmd run package:win on Windows.");
  process.exit(0);
}

const result = spawnSync("npm.cmd", ["run", "package:win"], {
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
