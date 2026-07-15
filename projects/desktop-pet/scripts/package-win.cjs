const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const electronDist = path.join(projectRoot, "node_modules", "electron", "dist");
const outputRoot = path.join(projectRoot, "release");
const outputDir = path.join(outputRoot, "win-unpacked");
const resourcesDir = path.join(outputDir, "resources");
const appDir = path.join(resourcesDir, "app");
const exeName = "DesktopPetLineDog.exe";

function assertInsideProject(targetPath) {
  const resolved = path.resolve(targetPath);
  const relative = path.relative(projectRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside project root: ${resolved}`);
  }
}

function assertExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} not found: ${targetPath}`);
  }
}

function assertWindowsPackageEnvironment() {
  if (process.platform !== "win32") {
    throw new Error(
      "package:win currently repackages the Windows Electron runtime and must be run on Windows. Run this command on a Windows machine, or replace this script with a cross-platform packager such as electron-builder if cross-building is required."
    );
  }

  if (!fs.existsSync(electronDist)) {
    throw new Error(
      `Electron runtime directory not found: ${electronDist}. Run "npm run install:deps" so Electron can download its runtime before packaging.`
    );
  }
}

function copyDirectory(source, destination, options = {}) {
  const ignore = options.ignore ?? (() => false);

  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (ignore(sourcePath, entry)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath, options);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function isPackagedAppRunning() {
  if (process.platform !== "win32") {
    return false;
  }

  try {
    const output = execFileSync("tasklist", ["/FI", `IMAGENAME eq ${exeName}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return output.toLowerCase().includes(exeName.toLowerCase());
  } catch {
    return false;
  }
}

function main() {
  assertInsideProject(outputDir);
  assertWindowsPackageEnvironment();
  assertExists(path.join(electronDist, "electron.exe"), "Electron runtime");
  assertExists(path.join(projectRoot, "dist", "index.html"), "Renderer build");
  assertExists(path.join(projectRoot, "electron", "main.cjs"), "Electron main process");
  assertExists(path.join(projectRoot, "pet-manifest.json"), "Pet manifest");

  if (isPackagedAppRunning()) {
    throw new Error(
      `${exeName} is currently running. Exit the desktop pet from the tray menu before rebuilding release/win-unpacked.`
    );
  }

  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(appDir, { recursive: true });

  copyDirectory(electronDist, outputDir, {
    ignore: (_sourcePath, entry) => entry.name === "default_app.asar"
  });

  const electronExe = path.join(outputDir, "electron.exe");
  const appExe = path.join(outputDir, exeName);
  if (fs.existsSync(appExe)) {
    fs.rmSync(appExe, { force: true });
  }
  fs.renameSync(electronExe, appExe);

  copyDirectory(path.join(projectRoot, "electron"), path.join(appDir, "electron"));
  copyDirectory(path.join(projectRoot, "dist"), path.join(appDir, "dist"));
  copyFile(path.join(projectRoot, "package.json"), path.join(appDir, "package.json"));
  copyFile(path.join(projectRoot, "pet-manifest.json"), path.join(appDir, "pet-manifest.json"));

  console.log(`Packaged Windows app: ${appExe}`);
  console.log("Run the executable from inside release/win-unpacked so Electron can find its runtime files.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
