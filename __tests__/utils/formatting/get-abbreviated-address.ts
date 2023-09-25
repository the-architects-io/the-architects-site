import { getAbbreviatedAddress } from "@/utils/formatting";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("getAbbreviatedAddress", () => {
  it("returns the first and last 4 characters of an address", () => {
    const keypair = Keypair.generate();

    expect(getAbbreviatedAddress(keypair.publicKey)).toBe(
      `${keypair.publicKey.toString().slice(0, 4)}...${keypair.publicKey
        .toString()
        .slice(-4)}`
    );
  });

  it("returns an empty string if the address is not a public key", () => {
    expect(getAbbreviatedAddress("not a public key")).toBe("");
  });

  it("returns an empty string if the address is empty", () => {
    expect(getAbbreviatedAddress("")).toBe("");
  });
});
