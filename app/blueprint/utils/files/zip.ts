import { ZipReader, BlobReader } from "@zip.js/zip.js";

export async function inspectZipFile(file: File) {
  const reader = new BlobReader(file as File);
  const zipReader = new ZipReader(reader);

  try {
    // Get all entries in the ZIP
    const entries = await zipReader.getEntries();
    let totalUncompressedSize = 0;

    entries.forEach((entry) => {
      if (!entry.directory) {
        totalUncompressedSize += entry.uncompressedSize;
      }
    });

    console.log(`Total Uncompressed Size: ${totalUncompressedSize} bytes`);
    debugger;

    await zipReader.close();
  } catch (error) {
    console.error("Error reading ZIP file:", error);
    // Handle error
  }
}
