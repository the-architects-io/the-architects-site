import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { client } from "@/graphql/backend-client";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { RPC_ENDPOINT } from "@/constants/constants";
import { ADD_ITEM_PAYOUT } from "@/graphql/mutations/add-item-payout";
import { NextRequest, NextResponse } from "next/server";
import { GET_WALLET_BY_ADDRESS } from "@/graphql/queries/get-wallet-by-address";
import { ADD_WALLET } from "@/graphql/mutations/add-wallet";
import { keypairIdentity, Metaplex, token } from "@metaplex-foundation/js";
import { ADD_LAST_CLAIM_TIMES } from "@/graphql/mutations/add-last-claim-time";
import { caluclateBuildVestingRewardAmount } from "@/utils/dispensers/calculate-token-claim-reward-amount";
import { GET_TOKENS_BY_MINT_ADDRESSES } from "@/graphql/queries/get-tokens-by-mint-addresses";
import { Dispenser, Token, Wallet } from "@/app/blueprint/types";

// Old endpoint currently supporting BUILD dispenser
export async function POST(req: NextRequest) {
  const {
    address,
    dispenserId,
    mintAddresses,
  }: {
    address: string;
    dispenserId: string;
    mintAddresses?: string[];
  } = await req.json();

  console.log({ address, dispenserId, mintAddresses });

  if (!process.env.BUILD_REWARD_PRIVATE_KEY || !address || !dispenserId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const { tokens }: { tokens: Token[] } = await client.request({
    document: GET_TOKENS_BY_MINT_ADDRESSES,
    variables: {
      mintAddresses,
    },
  });

  const lastClaimTimeToken = tokens.reduce((prev, current) => {
    return prev?.lastClaim?.createdAt > current?.lastClaim?.createdAt
      ? prev
      : current;
  });

  try {
    let dispenser: Dispenser | null = null;
    let rewardTxAddress: string | null = null;

    let payoutAmount = caluclateBuildVestingRewardAmount(
      mintAddresses?.length || 0,
      lastClaimTimeToken?.lastClaim?.createdAt
    );

    try {
      const { dispensers_by_pk }: { dispensers_by_pk: Dispenser } =
        await client.request(GET_DISPENSER_BY_ID, {
          id: dispenserId,
        });

      dispenser = dispensers_by_pk;

      const { rewardCollections } = dispenser;
      const rewardMintAddress = new PublicKey(
        rewardCollections[0].itemCollection.item.token.mintAddress
      );
      const rewardDecimals =
        rewardCollections[0].itemCollection.item.token.decimals;

      console.log({
        rewardMintAddress: rewardMintAddress.toString(),
        rewardDecimals,
      });

      const connection = new Connection(RPC_ENDPOINT);

      const rewardKeypair = Keypair.fromSecretKey(
        bs58.decode(process.env.BUILD_REWARD_PRIVATE_KEY)
      );
      const rewardPublicKey = new PublicKey(rewardKeypair.publicKey.toString());
      console.log({ rewardPublicKey: rewardPublicKey.toString() });

      const metaplex = Metaplex.make(connection);
      metaplex.use(keypairIdentity(rewardKeypair));
      const nft = await metaplex
        .nfts()
        .findByMint({ mintAddress: rewardMintAddress });

      const txBuilder = metaplex
        .nfts()
        .builders()
        .transfer({
          nftOrSft: nft,
          fromOwner: rewardPublicKey,
          toOwner: new PublicKey(address),
          amount: token(payoutAmount, rewardDecimals),
          authority: rewardKeypair,
        });

      const blockhash = await connection.getLatestBlockhash();

      const transaction = await txBuilder.toTransaction(blockhash);

      rewardTxAddress = await sendAndConfirmTransaction(
        connection,
        transaction,
        [rewardKeypair],
        {
          commitment: "confirmed",
          maxRetries: 2,
        }
      );
    } catch (error: any) {
      console.log("1!!", error);
      const { logs }: { logs: string[] } = error;

      // only handles NFTs, not SFTs
      if (logs.includes("Program log: Incorrect account owner")) {
        return NextResponse.json(
          { error, message: "Stock empty" },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error, message: "Failed to send reward" },
          { status: 400 }
        );
      }
    }

    let wallet;
    try {
      const { wallets }: { wallets: Wallet[] } = await client.request({
        document: GET_WALLET_BY_ADDRESS,
        variables: {
          address,
        },
      });

      if (wallets?.[0]) {
        wallet = wallets[0];
      } else {
        const { insert_wallets_one }: { insert_wallets_one: Wallet } =
          await client.request({
            document: ADD_WALLET,
            variables: {
              address,
            },
          });
        wallet = insert_wallets_one;
      }
    } catch (error) {
      console.log("2!!", error);
      return NextResponse.json(
        { error, message: "Failed to add wallet" },
        { status: 400 }
      );
    }

    if (!rewardTxAddress) {
      return NextResponse.json(
        { error: "Missing reward tx address" },
        { status: 400 }
      );
    }

    let payout;
    try {
      const { insert_payouts_one }: { insert_payouts_one: Wallet } =
        await client.request({
          document: ADD_ITEM_PAYOUT,
          variables: {
            txAddress: rewardTxAddress,
            amount: payoutAmount,
            tokenId:
              dispenser?.rewardCollections[0].itemCollection.item.token.id,
            itemId: dispenser?.rewardCollections[0].itemCollection.item.id,
            dispenserId,
            walletId: wallet.id,
          },
        });
      payout = insert_payouts_one;
    } catch (error) {
      console.log("ADD PAYOUT ERROR", error);
      return NextResponse.json(
        { error, message: "Failed to add payout" },
        { status: 400 }
      );
    }

    let updatedToken;

    try {
      const { update_tokens_by_pk }: { update_tokens_by_pk: Token } =
        await client.request({
          document: ADD_LAST_CLAIM_TIMES,
          variables: {
            mintAddresses,
            lastClaimId: payout.id,
          },
        });
      updatedToken = update_tokens_by_pk;
    } catch (error) {
      console.log("LAST CLAIM TIME ERROR", error);
      return NextResponse.json(
        { error, message: "Failed to add last claim time" },
        { status: 400 }
      );
    }

    return NextResponse.json({ rewardTxAddress, payout }, { status: 200 });
  } catch (error: any) {
    console.log("4!!", error);
    return NextResponse.json({ error: error?.message }, { status: 400 });
  }
}
