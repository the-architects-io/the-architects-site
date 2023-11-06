import { PublicKey } from "@metaplex-foundation/js";
import crypto from "crypto";

// Assuming you have a Solana wallet's public key as a string or byte array

// Derive a symmetric key from the Solana public key using a Key Derivation Function (KDF)
function deriveSymmetricKey(publicKey: PublicKey) {
  const keyBuffer = publicKey.toBuffer();

  // Use the PBKDF2 KDF to derive a symmetric key
  // Here we're using 'solana' as a salt; in practice, you might want a more complex and unique salt
  const symmetricKey = crypto.pbkdf2Sync(
    keyBuffer,
    "salty",
    100000,
    32,
    "sha512"
  );

  return symmetricKey;
}

function encryptWithAESKey(
  key: Buffer,
  data: ArrayBuffer
): {
  iv: string;
  encryptedData: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const dataStr = new TextDecoder().decode(data);
  let encrypted = cipher.update(dataStr, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
    authTag: tag.toString("hex"),
  };
}

export function decryptData(
  encryptedBlob: Blob,
  publicKey: PublicKey
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const symmetricKey = deriveSymmetricKey(publicKey);

    const reader = new FileReader();
    reader.onload = function (event) {
      const combinedBuffer = event.target?.result as ArrayBuffer;
      if (!combinedBuffer) {
        reject(new Error("Failed to read the blob content"));
        return;
      }

      const combinedBytes = new Uint8Array(combinedBuffer);
      const ivBytes = combinedBytes.slice(0, 16);
      const encryptedDataBytes = combinedBytes.slice(
        16,
        combinedBytes.length - 16
      );
      const authTagBytes = combinedBytes.slice(combinedBytes.length - 16);

      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        symmetricKey,
        ivBytes
      );
      decipher.setAuthTag(authTagBytes);
      let decrypted = decipher.update(encryptedDataBytes, undefined, "utf8");
      try {
        decrypted += decipher.final("utf8");
        resolve(decrypted);
      } catch (err) {
        reject(new Error("Decryption failed: " + err));
      }
    };
    reader.onerror = function () {
      reject(new Error("Error reading the encrypted blob"));
    };
    reader.readAsArrayBuffer(encryptedBlob);
  });
}

function appendFileExtension(
  filename: string,
  extensionToAppend: string
): string {
  return filename + "." + extensionToAppend;
}

export async function encryptFileList(
  fileList: FileList | File[],
  publicKey: PublicKey
): Promise<File[]> {
  const symmetricKey = deriveSymmetricKey(publicKey);
  const encryptedFiles: File[] = [];

  for (let file of Array.from(fileList)) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = function (loadEvent) {
        if (!loadEvent.target?.result) {
          reject(new Error("No file data"));
          return;
        }
        resolve(loadEvent.target.result as ArrayBuffer);
      };
      reader.onerror = function (errorEvent) {
        console.error("Error reading file:", errorEvent);
        reject(errorEvent);
      };
    });

    const encryptedDataObject = encryptWithAESKey(symmetricKey, arrayBuffer);

    // Convert hex strings to byte arrays
    const ivBytes = Buffer.from(encryptedDataObject.iv, "hex");
    const encryptedDataBytes = Buffer.from(
      encryptedDataObject.encryptedData,
      "hex"
    );
    const authTagBytes = Buffer.from(encryptedDataObject.authTag, "hex");

    // Combine the byte arrays
    const combinedBuffer = Buffer.concat([
      ivBytes,
      encryptedDataBytes,
      authTagBytes,
    ]);

    const newFileName = appendFileExtension(file.name, "arc");
    const encryptedFile = new File([combinedBuffer], newFileName, {
      type: "application/octet-stream",
    });
    encryptedFiles.push(encryptedFile);
  }

  return encryptedFiles;
}
