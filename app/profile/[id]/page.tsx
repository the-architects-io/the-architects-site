"use client";
import { Character } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { NotAdminBlocker } from "@/features/admin/not-admin-blocker";
import showToast from "@/features/toasts/show-toast";
import { GET_CHARACTER_BY_ID } from "@/graphql/queries/get-character-by-id";
import { GET_CHARACTER_BY_TOKEN_MINT_ADDRESS } from "@/graphql/queries/get-character-by-token-mint-address";
import { GET_PAYOUTS_BY_CHARACTER_ID } from "@/graphql/queries/get-payouts-by-character-id";
import { useAdmin } from "@/hooks/admin";
import { formatDateTime } from "@/utils/date-time";
import { getAbbreviatedAddress } from "@/utils/formatting";
import { getTraitsFromTraitInstances } from "@/utils/nfts/get-traits-from-trait-instances";
import { useQuery } from "@apollo/client";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type Payout = {
  id: string;
  amount: number;
  createdAt: string;
  txAddress: string;
  item: {
    id: string;
    name: string;
    imageUrl: string;
  };
  wallet: {
    id: string;
    address: string;
  };
  token: {
    id: string;
    name: string;
    imageUrl: string;
    mintAddress: string;
    items: {
      id: string;
      name: string;
      imageUrl: string;
    }[];
    characters: {
      id: string;
      name: string;
      imageUrl: string;
    };
  };
};

export type ModeledTrait = {
  id?: string;
  name?: string;
  trait_type?: string;
  value: string;
};

export default function ProfilePage({ params }: { params: any }) {
  const { id } = params;
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [traits, setTraits] = useState<ModeledTrait[] | null>(null);
  const [traitCombinationHash, setTraitCombinationHash] = useState<
    string | null
  >(null);
  const [isVerifiedTraitHash, setIsVerifiedTraitHash] =
    useState<boolean>(false);
  const [isUpdatingCharacter, setIsUpdatingCharacter] =
    useState<boolean>(false);

  const verifyTraitCombination = async (traits: ModeledTrait[]) => {
    const { data } = await axios.post(
      `${BASE_URL}/api/trait-combination-exists`,
      {
        combinations: traits,
      }
    );
    setIsVerifiedTraitHash(data?.exists);
  };

  const updateDisplayedCharacterInfo = (character: Character) => {
    setCharacter(character);
    setIsUpdatingCharacter(false);
    const traits: ModeledTrait[] = getTraitsFromTraitInstances(
      character?.traitInstances
    );
    verifyTraitCombination(traits);
    setTraits(traits);
    setTraitCombinationHash(character?.traitCombinationHash || "");
  };

  const isPublicKey = (id: string | string[] | null) => {
    if (!id || Array.isArray(id)) return false;

    try {
      return !!new PublicKey(id);
    } catch (error) {
      return false;
    }
  };

  const { loading, refetch } = useQuery(GET_CHARACTER_BY_ID, {
    variables: {
      id,
    },
    skip: !id || isPublicKey(id),
    fetchPolicy: "network-only",
    onCompleted: async ({
      characters_by_pk,
    }: {
      characters_by_pk: Character;
    }) => {
      console.log({ characters_by_pk });
      updateDisplayedCharacterInfo(characters_by_pk);
    },
  });

  const { loading: loadingByMintAddress } = useQuery(
    GET_CHARACTER_BY_TOKEN_MINT_ADDRESS,
    {
      variables: {
        mintAddress: id,
      },
      skip: !id || !isPublicKey(id),
      fetchPolicy: "network-only",
      onCompleted: async ({ characters }) => {
        console.log({ characters });
        updateDisplayedCharacterInfo(characters?.[0]);
      },
    }
  );

  const { loading: payoutsLoading } = useQuery(GET_PAYOUTS_BY_CHARACTER_ID, {
    variables: {
      id,
    },
    skip: !id,
    onCompleted: ({ payouts }) => {
      console.log({ payouts });
      setPayouts(payouts);
    },
  });

  const updateCharacter = async () => {
    setIsUpdatingCharacter(true);
    console.log({ character });

    const { data } = await axios.post(
      `${BASE_URL}/api/update-character-by-mint-address`,
      {
        mintAddress: character?.token.mintAddress,
      }
    );
    setTimeout(() => {
      refetch();
      showToast({
        primaryMessage: "Tokena & character updated from Solana",
      });
      setIsUpdatingCharacter(false);
    }, 100);
    console.log({ data });
  };

  if (!isAdmin) return <NotAdminBlocker />;

  if (loading || payoutsLoading || loadingByMintAddress)
    return (
      <ContentWrapper>
        <div className="flex s-full justify-center">
          <Spinner />
        </div>
      </ContentWrapper>
    );

  if (!character) {
    return (
      <ContentWrapper>
        <div className="flex s-full justify-center">
          <div className="text-5xl font-strange-dreams text-center mb-12 tracking-wider">
            Character not found
          </div>
        </div>
      </ContentWrapper>
    );
  }

  const { name } = character;

  return (
    <ContentWrapper className="flex flex-wrap">
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <Image
          src={character.imageUrl}
          alt={character.name}
          className="w-96 h-96 mb-8 rounded-xl"
          width={500}
          height={500}
        />
        <h1 className="text-4xl font-strange-dreams text-center mb-4 tracking-wider">
          {name}
        </h1>
        <div className="flex w-full justify-between mb-4 max-w-xs text-2xl font-strange-dreams">
          <div>Mint</div>
          <div className="break-all">
            {getAbbreviatedAddress(character.token.mintAddress)}
          </div>
          <a
            className="flex justify-center items-center underline"
            href={`https://solscan.io/token/${character.token.mintAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/images/solana-logo.svg"
              width={12}
              height={12}
              alt="Solana"
            />
          </a>
        </div>
        <div className="flex flex-wrap w-full justify-between mb-16 max-w-xs text-2xl font-strange-dreams">
          {/* <div>Trait Hash:</div>
          <div className="break-all mb-2">
            {getAbbreviatedAddress(character.traitCombinationHash || "")}
          </div>
          {!!isVerifiedTraitHash && (
            <div className="flex w-full items-center space-x-2 py-2">
              <CheckBadgeIcon className="w-6 h-6 text-green-500" />
              <div>Verified</div>
            </div>
          )} */}
          {/* <PrimaryButton
            className="flex mt-4 w-full justify-center"
            onClick={updateCharacter}
          >
            {isUpdatingCharacter ? <Spinner /> : "Update Character"}
          </PrimaryButton> */}
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <div className="max-w-md w-full text-xl leading-8 font-strange-dreams mb-16 px-4">
          <h2 className="text-3xl font-strange-dreams text-center mb-8 tracking-wider">
            Traits
          </h2>
          {!!traits &&
            // @ts-ignore
            traits.map(({ id, value, name }) => (
              <div key={id} className="flex w-full justify-between">
                <div>{name}</div>
                <div>{value}</div>
              </div>
            ))}
          <h2 className="text-3xl font-strange-dreams text-center mb-4 tracking-wider mt-8">
            Payouts
          </h2>
          {!!payouts?.length &&
            payouts.map(({ id, token, amount, createdAt, txAddress }) => (
              <div
                key={id}
                className="flex w-full justify-between text-base leading-8"
              >
                <div>{formatDateTime(createdAt)}</div>
                <div>{token?.items?.[0]?.name}</div>
                <div>{amount}</div>
                <a
                  className="flex justify-center items-center underline"
                  href={`https://solscan.io/tx/${txAddress}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src="/images/solana-logo.svg"
                    width={12}
                    height={12}
                    alt="Solana"
                  />
                </a>
              </div>
            ))}
        </div>
      </div>
    </ContentWrapper>
  );
}
