import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

type Arguments = {
  source: string;
  destination: string;
};

const argv = yargs(hideBin(process.argv))
  .option("source", {
    alias: "s",
    description: "The source directory",
    type: "string",
    demandOption: true,
  })
  .option("destination", {
    alias: "d",
    description: "The destination directory",
    type: "string",
    demandOption: true,
  })
  .help()
  .strict()
  .parseSync() as Arguments;

const { source: sourceDir, destination: destinationDir } = argv;

// Ensure the destination directory exists
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

// Read the files from source directory
fs.readdir(sourceDir, (err, files) => {
  if (err) {
    console.error("Error reading source directory:", err);
    return;
  }

  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const destinationPath = path.join(destinationDir, file);

    // Copy each file to destination
    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error(`Error copying file ${file}:`, err);
        return;
      }
      console.log(`Copied ${file} to ${destinationPath}`);
    });
  });
});
