import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ArchitectsTokenDispenser } from "../target/types/architects_token_dispenser";

describe("architects", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .Architects as Program<ArchitectsTokenDispenser>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize("asdf").rpc();
    console.log("Your transaction signature", tx);
  });
});
