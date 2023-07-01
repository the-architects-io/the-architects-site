import { ErrorResponse } from "@/app/blueprint/types";
import { BASE_URL } from "@/constants/constants";
import { PublicKey } from "@metaplex-foundation/js";
import axios from "axios";

const fetchTokenBalance = async (
  mintAddress: string,
  walletAddress: PublicKey | string
): Promise<number | ErrorResponse> => {
  if (!mintAddress || !walletAddress) return Promise.reject("No cost");

  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/get-token-balances-from-helius`,
        {
          walletAddress:
            typeof walletAddress === "string"
              ? walletAddress
              : walletAddress.toString(),
          mintAddresses: [mintAddress],
        }
      );
      resolve(data?.[0]?.amount || 0);
    } catch (error: any) {
      return reject({
        success: false,
        message: error?.response?.data?.message,
      });
    }
  });
};

export default fetchTokenBalance;
