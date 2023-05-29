import type {
  BlockheightBasedTransactionConfirmationStrategy,
  ConfirmOptions,
  Connection,
  Signer,
  Transaction,
} from "@solana/web3.js";

export const executeTransaction = async (
  connection: Connection,
  transaction: Transaction,
  config: {
    silent?: boolean;
    signers?: Signer[];
    confirmOptions?: ConfirmOptions;
    notificationConfig?: {
      message?: string;
      errorMessage?: string;
      description?: string;
    };
    callback?: () => void;
    successCallback?: () => void;
  },
  wallet?: any,
): Promise<string> => {
  let txId = "";
  try {
    transaction.feePayer = wallet.publicKey;
    const signedTx = await wallet.signTransaction(transaction);

    const latestBlockHash = await connection.getLatestBlockhash();

    const signature = await connection.sendRawTransaction(signedTx.serialize());

    const confirmStrategy: BlockheightBasedTransactionConfirmationStrategy = {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature,
    };

    const result = await connection.confirmTransaction(confirmStrategy);
    if (result.value.err) {
      throw new Error(
        "failed to confirm transaction " + signature + ": " + result.value.err,
      );
    }
    
    txId = signature;
    config.successCallback && config.successCallback();
  } catch (error) {
    console.error("error sending reward to burning wallet", { error });
  } finally {
    config.callback && config.callback();
  }
  return txId;
};
