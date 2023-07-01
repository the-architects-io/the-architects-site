"use client";
import { Payout } from "@/app/profile/[id]/page";
import { BASE_URL } from "@/constants/constants";
import { Dispenser } from "@/features/admin/dispensers/dispensers-list-item";
import { RewardsList } from "@/features/rewards/rewards-list";
import showToast from "@/features/toasts/show-toast";
import { SubmitButton } from "@/features/UI/buttons/submit-button";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import Spinner from "@/features/UI/spinner";
import { UserWithoutAccountBlocker } from "@/features/UI/user-without-account-blocker";
import { GET_DISPENSER_BY_ID } from "@/graphql/queries/get-dispenser-by-id";
import { useAdmin } from "@/hooks/admin";
import useDispenser from "@/hooks/blueprint/use-dispenser";
import { useUser } from "@/hooks/user";
import { formatDateTime } from "@/utils/date-time";
import { fetchNftsByHashList } from "@/utils/nfts/fetch-nfts-by-hash-list";
import { executeTransaction } from "@/utils/transactions/execute-transaction";
import { useMutation, useQuery } from "@apollo/client";
import {
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  TransactionInstructionCtorFields,
} from "@solana/web3.js";
import axios from "axios";
import { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

export default function LootBoxDetailPage({ params }: { params: any }) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { user, loadingUser, setUser } = useUser();
  const { isAdmin } = useAdmin();
  const { claimReward, cost, getCostBalance } = useDispenser(params?.id);

  const [lootBox, setLootBox] = useState<Dispenser | null>(null);
  const [rewardHashList, setRewardHashList] = useState<string[]>([]);
  const [costHashList, setCostHashList] = useState<string[]>([]);
  const [itemRewardCollectionId, setItemRewardCollectionId] = useState<
    string | null
  >(null);
  const [costTokenImageUrl, setCostTokenImageUrl] = useState<string | null>(
    null
  );
  const [costItem, setCostItem] = useState<any | null>(null);
  const [costItemMintAddress, setCostItemMintAddress] = useState<string | null>(
    null
  );
  const [amountOfUserHeldCostTokens, setAmountOfUserHeldCostTokens] =
    useState<number>(0);
  const [hasFetchedUserHeldCostTokens, setHasFetchedUserHeldCostTokens] =
    useState<boolean>(false);
  const [costAmount, setCostAmount] = useState<number>(0);
  const [nftMintAddressesToBurn, setNftMintAddressesToBurn] = useState<
    string[]
  >([]);
  const [transferInProgress, setTransferInProgress] = useState<boolean>(false);
  const [userPayouts, setUserPayouts] = useState<Payout[]>([]);

  const { loading: loadingLootBox } = useQuery(GET_DISPENSER_BY_ID, {
    variables: { id: params?.id },
    skip: !params?.id,
    onCompleted: async ({
      dispensers_by_pk: dispenser,
    }: {
      dispensers_by_pk: Dispenser;
    }) => {
      setLootBox(dispenser);

      // *** item based rewards and costs ***
      if (
        !dispenser?.rewardCollections?.length ||
        !dispenser?.costCollections?.length
      )
        return;
      const {
        item: costItem,
        amount: costAmount,
        imageUrl,
      } = dispenser?.costCollections?.[0]?.itemCollection;
      setCostItem(costItem);
      setCostItemMintAddress(costItem.token.mintAddress);
      setCostAmount(costAmount);
      setCostTokenImageUrl(imageUrl);
      if (!wallet?.publicKey || !cost) return;
      const balance = await getCostBalance(cost, wallet.publicKey.toString());
      setAmountOfUserHeldCostTokens(balance);
    },
  });

  const handleTransferCostTokens = useCallback(async () => {
    if (
      !wallet?.publicKey ||
      !wallet?.signTransaction ||
      !costItem?.token?.mintAddress
    )
      return;
    const { mintAddress } = costItem.token;
    console.log("cost token", mintAddress);
    setTransferInProgress(true);
    showToast({
      primaryMessage: "Exchanging token...",
      secondaryMessage: "Please do not close this window.",
    });

    const instructions: TransactionInstructionCtorFields[] = [];

    const fromTokenAccountAddress = await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      wallet.publicKey
    );

    instructions.push(
      createBurnCheckedInstruction(
        fromTokenAccountAddress,
        new PublicKey(mintAddress),
        wallet.publicKey,
        costAmount,
        0
      )
    );

    // only apples to NFTs
    // instructions.push(
    //   createCloseAccountInstruction(
    //     fromTokenAccountAddress,
    //     wallet.publicKey,
    //     wallet.publicKey
    //   )
    // );

    const latestBlockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({ ...latestBlockhash });
    transaction.add(...instructions);

    let burnTxAddress;
    try {
      burnTxAddress = await executeTransaction(
        connection,
        transaction,
        {},
        wallet
      );
      if (!burnTxAddress) {
        setTransferInProgress(false);
        return;
      }
      showToast({
        primaryMessage: "Opening...",
        secondaryMessage: "Please do not close this window.",
      });

      const { rewardTxAddress, payout } = await claimReward(
        wallet.publicKey.toString()
      );

      setAmountOfUserHeldCostTokens(amountOfUserHeldCostTokens - costAmount);
      setTransferInProgress(false);

      showToast({
        primaryMessage: "Success!",
        secondaryMessage: `You received ${payout?.amount}x ${payout?.token?.name}.`,
      });

      // refetchPayouts();

      console.log({
        burnTxAddress,
        rewardTxAddress,
        lootBoxId: lootBox?.id,
      });
    } catch (error) {
      showToast({
        primaryMessage: "Error",
        secondaryMessage: "Something went wrong.",
      });
      console.log(error);
    } finally {
      setTransferInProgress(false);
    }
  }, [
    wallet,
    costItem?.token,
    costAmount,
    connection,
    claimReward,
    amountOfUserHeldCostTokens,
    lootBox?.id,
  ]);

  const fetchUserHeldCostTokensViaHashList = useCallback(async () => {
    if (
      !wallet?.publicKey ||
      !user ||
      !connection ||
      !costHashList.length ||
      hasFetchedUserHeldCostTokens
    )
      return;

    const costTokens = await fetchNftsByHashList({
      hashList: costHashList,
      publicKey: wallet.publicKey,
      connection,
    });
    setAmountOfUserHeldCostTokens(costTokens.length);
    setHasFetchedUserHeldCostTokens(true);

    if (costTokens.length >= costAmount) {
      const addresses = costTokens.slice(0, costAmount);
      console.log("addresses", addresses);
      setNftMintAddressesToBurn(addresses.map((token) => token.mintAddress));
      return;
    }
  }, [
    wallet.publicKey,
    user,
    connection,
    costHashList,
    hasFetchedUserHeldCostTokens,
    costAmount,
  ]);

  useEffect(() => {
    console.log({
      userHeldCostTokens: amountOfUserHeldCostTokens,
      costAmount,
    });
    if (user && !wallet?.publicKey) {
      setUser(null);
    }
  }, [
    user,
    wallet?.publicKey,
    amountOfUserHeldCostTokens,
    costAmount,
    fetchUserHeldCostTokensViaHashList,
    setUser,
  ]);

  if (loadingLootBox) {
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">
          <Spinner />
        </div>
      </ContentWrapper>
    );
  }

  if (!!lootBox?.id && !lootBox?.isEnabled && !isAdmin) {
    return (
      <ContentWrapper className="flex flex-col items-center">
        <div className="pt-48">No lootbox found</div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <h1 className="text-5xl text-center mb-12 tracking-wider">
        {lootBox?.name}
      </h1>
      {!lootBox?.isEnabled && isAdmin && (
        <div className="text-2xl uppercase text-gray-800 bg-stone-300 p-2 rounded-lg w-full text-center mb-16 max-w-md mx-auto">
          disabled
        </div>
      )}
      <div className="flex items-center justify-center flex-wrap mb-16">
        <div className="flex-col flex w-full justify-center md:w-1/2 items-center mb-16 md:mb-0">
          <ImageWithFallback
            className="rounded-2xl border-2 border-sky-300"
            src={lootBox?.imageUrl || ""}
            width={400}
            height={400}
            alt="Lootbox image"
          />
          <div className="italic text-2xl max-w-sm text-center mt-6">
            {lootBox?.description}
          </div>
        </div>
        <div className="w-full px-2 md:px-0 md:w-1/2">
          <div className="flex flex-col w-full mx-auto text-xl border-2 border-sky-300 rounded-2xl p-6">
            <div className="text-center uppercase text-3xl mb-2">
              Possible Rewards
            </div>
            {!!lootBox && <RewardsList dispenserId={lootBox.id} />}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center mb-8 text-4xl space-x-0 md:space-x-8 space-y-6 md:space-y-0">
        <ImageWithFallback
          src={costTokenImageUrl || ""}
          width={100}
          height={100}
          alt="Cost token image"
          className=" rounded-2xl h-28 w-28"
        />
        <div className="flex flex-col space-y-3">
          <div className="flex w-full md:w-auto items-center justify-center space-x-3">
            <div className="uppercase">Cost:</div>
            <div>{costAmount}</div>
          </div>
          <div className="flex w-full md:w-auto items-center justify-center space-x-3">
            <div className="uppercase">You have:</div>
            {hasFetchedUserHeldCostTokens ? (
              <div>{amountOfUserHeldCostTokens}</div>
            ) : (
              <Spinner />
            )}
          </div>
        </div>
      </div>
      {/* {!!costAmount && (
      )} */}
      <div className="pb-12 pt-4 w-full justify-center flex">
        <SubmitButton
          className="text-2xl"
          isSubmitting={transferInProgress}
          onClick={handleTransferCostTokens}
          disabled={!(amountOfUserHeldCostTokens >= costAmount)}
        >
          Claim
        </SubmitButton>
      </div>
      {/* <div className="text-2xl tracking-widest text-center mb-4">
        Your Payouts
      </div>
      {!!userPayouts?.length ? (
        <div className="flex flex-col justify-center items-center space-y-2 pb-16">
          {userPayouts.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-center space-x-12 text-lg"
            >
              <div>{formatDateTime(payout.createdAt)}</div>
              <div className="uppercase">
                {payout.amount == 1 ? "" : payout.amount / 1000000000}{" "}
                {payout?.item?.name ? payout?.item?.name : payout?.token?.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center pb-16">You have no payouts yet</div>
      )} */}
    </ContentWrapper>
  );
}
