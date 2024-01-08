"use client";

import { MerkleTree } from "@/app/blueprint/types";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import Spinner from "@/features/UI/spinner";
import { MintCnft } from "@/features/cnfts/mint-cnft";
import { MerkleTreeDetails } from "@/features/merkle-trees/merkle-tree-details";
import { GET_MERKLE_TREE_BY_ADDRESS } from "@/graphql/queries/get-merkle-tree-by-address";
import { GET_MERKLE_TREE_BY_ID } from "@/graphql/queries/get-merkle-tree-by-id";
import { isValidPublicKey } from "@/utils/rpc";
import { useQuery } from "@apollo/client";
import { useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const [tree, setTree] = useState<MerkleTree | null>(null);

  const {
    data,
    loading: loadingTreeById,
    refetch: refetchById,
  } = useQuery(GET_MERKLE_TREE_BY_ID, {
    variables: {
      id,
    },
    skip: !id || isValidPublicKey(id),
    onCompleted: ({ merkleTrees_by_pk }) => {
      setTree(merkleTrees_by_pk);
    },
  });

  const { loading: loadingTreeByAddress, refetch: refetchByAddress } = useQuery(
    GET_MERKLE_TREE_BY_ADDRESS,
    {
      variables: {
        address: id,
      },
      skip: !id || !isValidPublicKey(id),
      onCompleted: ({ merkleTrees }) => {
        if (merkleTrees?.length) {
          setTree(merkleTrees[0]);
        }
      },
    }
  );

  if (loadingTreeById || loadingTreeByAddress) {
    return (
      <ContentWrapper className="flex flex-col justify-center items-center">
        <Spinner />
      </ContentWrapper>
    );
  }

  if (!tree) {
    return (
      <ContentWrapper className="flex flex-col justify-center items-center">
        <div className="text-2xl mb-4">Tree not found</div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper className="flex flex-col justify-center items-center w-full">
      <MerkleTreeDetails tree={tree} />

      <div className="text-2xl mt-8">Mint cNFT to Tree</div>
      <MintCnft
        onCompleted={() => {
          refetchById();
          refetchByAddress();
        }}
        treeAddress={tree.address}
      />
    </ContentWrapper>
  );
}
