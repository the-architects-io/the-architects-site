import { RPC_ENDPOINT } from "@/constants/constants";
import {
  Metaplex,
  PublicKey,
  Signer,
  token,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection, Transaction } from "@solana/web3.js";

export const sendNft = async (
  mintPubKey: PublicKey,
  fromPubKey: PublicKey,
  toPubKey: PublicKey,
  feePayer: Signer
): Promise<Transaction> => {
  // const feePayer: Signer = {
  //   publicKey: fromPubKey,
  //   signTransaction: async (tx) => tx,
  //   signMessage: async (msg) => msg,
  //   signAllTransactions: async (txs) => txs,
  // };

  const web3Conn = new Connection(RPC_ENDPOINT);
  const metaplex = new Metaplex(web3Conn);
  metaplex.use(
    walletAdapterIdentity({
      publicKey: fromPubKey,
      signTransaction: async (tx) => tx,
    })
  );

  const nft = await metaplex.nfts().findByMint({ mintAddress: mintPubKey });

  const txBuilder = metaplex
    .nfts()
    .builders()
    .transfer({
      nftOrSft: nft,
      fromOwner: fromPubKey,
      toOwner: toPubKey,
      amount: token(1),
      authority: feePayer,
    });

  const blockhash = await web3Conn.getLatestBlockhash();

  return txBuilder.toTransaction(blockhash);
};
