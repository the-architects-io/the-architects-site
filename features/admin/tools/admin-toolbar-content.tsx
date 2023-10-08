"use client";
import { PrimaryButton } from "@/features/UI/buttons/primary-button";
import WalletButton from "@/features/UI/buttons/wallet-button";
import showToast from "@/features/toasts/show-toast";
import { useAdmin } from "@/hooks/admin";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import "react18-json-view/src/dark.css";

export default function AdminToolbarContent() {
  const { adminToolbarData, setShouldForceEnableClaim } = useAdmin();

  const handleForceEnableClaim = () => {
    setShouldForceEnableClaim(true);
    showToast({
      primaryMessage: "Claim Enabled",
    });
  };

  return (
    <div className="h-64 bg-gray-700 border-t border-gray-600 mt-10 p-8 flex w-full">
      <div className="w-[300px]">
        <div className="mb-4">
          <WalletButton />
        </div>
        <PrimaryButton className="mb-4" onClick={handleForceEnableClaim}>
          Force Enable Claim
        </PrimaryButton>
      </div>
      <div className="w-full">
        <div className="overflow-y-auto h-52">
          {!!adminToolbarData && (
            <JsonView src={adminToolbarData} dark={true} collapsed={true} />
          )}
        </div>
      </div>
    </div>
  );
}
