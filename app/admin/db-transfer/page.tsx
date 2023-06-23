"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useAdmin } from "@/hooks/admin";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useUser } from "@/hooks/user";
import Spinner from "@/features/UI/spinner";
import { Panel } from "@/features/UI/panel";

export default function FetchPage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [hashList, setHashList] = useState<string>("");
  const [nftCollectionId, setNftCollectionId] = useState<string>("");
  const [totalNftsToAdd, setTotalNftsToAdd] = useState<number>(0);
  const [currentNftToAdd, setCurrentNftToAdd] = useState<number>(0);
  const [numberOfSuccesses, setNumberOfSuccesses] = useState<number>(0);
  const [numberOfSkips, setNumberOfSkips] = useState<number>(0);
  const [failedAdditions, setFailedAdditions] = useState<string[]>([]);

  if (!isAdmin) return null;

  return (
    <ContentWrapper>
      <Panel className="mb-8">asdf</Panel>
    </ContentWrapper>
  );
}
