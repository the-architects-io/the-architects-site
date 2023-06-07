import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import bs58 from "bs58";
import { client } from "@/graphql/backend-client";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { RPC_ENDPOINT } from "@/constants/constants";
import { ADD_ITEM_PAYOUT } from "@/graphql/mutations/add-item-payout";
import {
  createAssociatedTokenAccountInstruction,
  createFreezeAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { NextRequest, NextResponse } from "next/server";
// import { GET_USER_BY_WALLET_ADDRESS } from "graphql/queries/get-user-by-wallet-address";

type Data =
  | {
      rewardTxAddress: string;
      data: any;
    }
  | {
      error: string;
    };

export async function POST(req: NextRequest) {
  const {
    address,
    dispenserId,
  }: {
    address: string;
    dispenserId: string;
  } = await req.json();

  if (!process.env.REWARD_PRIVATE_KEY || !address || !dispenserId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const { dispensers_by_pk: dispenser }: { dispensers_by_pk: Dispenser } =
      await client.request(GET_DISPENSER_BY_ID, {
        id: dispenserId,
      });

    const { rewardCollections } = dispenser;
    const rewardMintAddress = new PublicKey(
      rewardCollections[0].itemCollection.item.token.mintAddress
    );

    const connection = new Connection(RPC_ENDPOINT);
    let payoutAmount = 1;

    const rewardKeypair = Keypair.fromSecretKey(
      bs58.decode(process.env.REWARD_PRIVATE_KEY)
    );
    const rewardPublicKey = new PublicKey(rewardKeypair.publicKey.toString());

    let rewardTxAddress;

    const fromUserAccount = new PublicKey(address);

    const fromTokenAccountAddress = await getAssociatedTokenAddress(
      rewardMintAddress,
      rewardPublicKey
    );

    const toTokenAccountAddress = await getAssociatedTokenAddress(
      rewardMintAddress,
      new PublicKey(fromUserAccount)
    );

    const receiverAccount = await connection.getAccountInfo(
      toTokenAccountAddress
    );

    const latestBlockhash2 = await connection.getLatestBlockhash();
    const rewardTransaction = new Transaction({ ...latestBlockhash2 });

    const rewardInstructions: TransactionInstructionCtorFields[] = [];
    if (!receiverAccount) {
      rewardInstructions.push(
        createAssociatedTokenAccountInstruction(
          rewardPublicKey,
          toTokenAccountAddress,
          new PublicKey(fromUserAccount),
          rewardMintAddress
        )
      );
    }

    rewardInstructions.push(
      createTransferInstruction(
        fromTokenAccountAddress,
        toTokenAccountAddress,
        rewardPublicKey,
        payoutAmount
      ),
      createFreezeAccountInstruction(
        toTokenAccountAddress,
        rewardMintAddress,
        rewardPublicKey
      )
    );

    rewardTransaction.add(...rewardInstructions);

    rewardTxAddress = await sendAndConfirmTransaction(
      connection,
      rewardTransaction,
      [rewardKeypair],
      {
        commitment: "confirmed",
        maxRetries: 2,
      }
    );

    let payout;
    try {
      const { token, id: itemId } =
        dispenser.rewardCollections[0].itemCollection.item;

      const { insert_payouts_one }: { insert_payouts_one: any } =
        await client.request({
          document: ADD_ITEM_PAYOUT,
          variables: {
            txAddress: rewardTxAddress,
            amount: payoutAmount,
            tokenId: token.id,
            itemId,
            dispenserId,
          },
        });
      payout = insert_payouts_one;
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error, message: "Failed to add payout" },
        { status: 400 }
      );
    }

    return NextResponse.json({ rewardTxAddress, payout }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error?.message }, { status: 400 });
  }
}
