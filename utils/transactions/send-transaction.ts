import { handleError } from "@/utils/errors/log-error";
import { Provider } from "@coral-xyz/anchor";
import { Connection, Transaction } from "@solana/web3.js";

export const sendTransaction = async (
  transaction: Transaction,
  provider: Provider,
  connection: Connection
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!provider?.sendAndConfirm) return;
    const wallet = provider.publicKey;

    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = wallet;

    let txHash;
    try {
      txHash = await provider.sendAndConfirm(transaction);
      console.log("txHash", txHash);
      resolve(txHash);
    } catch (error) {
      handleError(error as Error);
      reject(error);
    }
  });
};
