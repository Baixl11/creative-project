const { spawnSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const electronBin = path.join(projectRoot, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron");
const outPath = path.join(projectRoot, "docs", "codex", "pet-redesign-preview.png");
const command = process.platform === "win32" ? "cmd.exe" : electronBin;
const args = process.platform === "win32" ? ["/c", electronBin, projectRoot] : [projectRoot];

const result = spawnSync(command, args, {
  cwd: projectRoot,
  env: {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: "1",
    ELECTRON_DISABLE_SECURITY_WARNINGS: "1",
    LIBGL_ALWAYS_SOFTWARE: "1",
    PET_PREVIEW_CAPTURE_PATH: outPath
  },
  encoding: "utf8",
  stdio: "pipe"
});

if (result.status !== 0) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.error) {
    console.error(result.error);
  }
  console.error(`Pet preview capture failed with status ${result.status ?? "unknown"}.`);
  process.exit(result.status ?? 1);
}

if (result.stdout) {
  process.stdout.write(result.stdout);
}
if (result.stderr) {
  process.stderr.write(result.stderr);
}
console.log(`Saved pet preview to ${outPath}`);
