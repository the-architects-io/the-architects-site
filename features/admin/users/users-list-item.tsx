import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import { ImageWithFallback } from "@/features/UI/image-with-fallback";
import { TableRow } from "@/features/UI/tables/table-row";
import showToast from "@/features/toasts/show-toast";
import { copyTextToClipboard } from "@/utils/clipboard";
import { formatDateTime } from "@/utils/date-time";
import { getAbbreviatedAddress } from "@/utils/formatting";
import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  wallets: {
    id: string;
    address: string;
  }[];
  primaryWallet: {
    id: string;
    address: string;
  };
  accounts: {
    id: string;
    provider: {
      id: string;
      name: string;
    };
    createdAt: string;
    imageUrl: string;
    username: string;
    email: string;
  }[];
  imageUrl: string;
};

export const UsersListItem = ({
  user,
  refetch,
}: {
  user: User;
  refetch: () => void;
}) => {
  const deleteUser = async () => {
    if (window.confirm("Do you really want to delete this user?")) {
      try {
        await axios.post("/api/remove-user", { id: user.id });
        showToast({
          primaryMessage: "User deleted",
        });
        refetch();
      } catch (error) {
        showToast({
          primaryMessage: "Error deleting user",
        });
      }
    }
  };
  return (
    <TableRow keyId={user.id}>
      <ImageWithFallback
        className="rounded-2xl"
        src={user.imageUrl || ""}
        width={60}
        height={60}
        alt="User image"
      />
      <div className="w-1/5 truncate">{formatDateTime(user.createdAt)}</div>
      <div className="w-1/5 truncate">{user.name}</div>
      {!!user.email && <div className="w-1/5 truncate">{user.email}</div>}
      <div className="w-1/4 truncate flex items-center space-x-2">
        {!!user.primaryWallet && (
          <>
            <div>{getAbbreviatedAddress(user.primaryWallet.address)}</div>
            <button
              onClick={() => copyTextToClipboard(user.primaryWallet.address)}
            >
              <ClipboardDocumentListIcon className="h-5 w-5 text-stone-300" />
            </button>
          </>
        )}
      </div>
      <div className="w-1/4 truncate flex items-center space-x-2">
        {!!user.accounts?.[0] && (
          <>
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <div>{user.accounts[0]?.provider.name}</div>
          </>
        )}
      </div>
      <div className="flex flex-grow"></div>
      <button onClick={deleteUser}>
        <TrashIcon className="h-6 w-6 text-stone-300" />
      </button>
    </TableRow>
  );
};
