import { ModeledTrait } from "@/pages/profile/[id]";
const crypto = require("crypto").webcrypto;

export const getHashForTraitCombination = async (traits: ModeledTrait[]) => {
  const traitValues = traits.map(({ value }) => value).sort();
  const traitKeys = traits.map(({ name }) => name).sort();
  const traitValuesString = traitValues.join("");
  const traitKeysString = traitKeys.join("");
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(traitValuesString + traitKeysString)
  );
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  console.log({ hashHex, hashArray });

  return hashHex;
};
