import fs from "fs-extra";
import path from "path";

// Get the release folder path from the CLI arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Error: Please provide the path to the release folder as an argument.");
  process.exit(1);
}

const releaseFolder = path.resolve(args[0]);
const distFolder = path.resolve("dist");

console.log(`Copying files from "${distFolder}" to "${releaseFolder}"...`);

// Ensure the release folder exists
fs.ensureDirSync(releaseFolder);

// Copy files from `dist` to the release folder
try {
  fs.copySync(distFolder, releaseFolder, { overwrite: true });
  console.log(`Contents of "${distFolder}" have been successfully copied to "${releaseFolder}".`);
} catch (err) {
  console.error("Error copying files:", err.message);
  process.exit(1);
}