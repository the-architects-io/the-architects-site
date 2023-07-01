import { TokenBalance } from "@/app/api/get-token-balances-from-helius/route";
import { BASE_URL } from "@/constants/constants";
import { PublicKey } from "@metaplex-foundation/js";
import axios from "axios";

const fetchTokenBalances = async (
  mintAddresses: string[],
  walletAddress: PublicKey | string
): Promise<TokenBalance[]> => {
  if (!mintAddresses?.length || !walletAddress)
    return Promise.reject("No cost");

  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/get-token-balances-from-helius`,
        {
          walletAddress:
            typeof walletAddress === "string"
              ? walletAddress
              : walletAddress.toString(),
          mintAddresses,
        }
      );
      console.log({ data });
      return resolve(data);
    } catch (error: any) {
      console.log({
        success: false,
        message: error?.response?.data?.message,
      });
      return reject([]);
    }
  });
};

export default fetchTokenBalances;
