import classNames from "classnames";
import ClientOnly from "@/features/client-only";
import Overlay from "@/features/overlay";
import Link from "next/link";
import { KeyIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type Props = {
  isOpenSidebar: boolean;
  toggleSidebar: () => void;
};

export const Sidebar = ({ isOpenSidebar, toggleSidebar }: Props) => {
  const handleCloseSidebar = () => {
    if (isOpenSidebar) {
      toggleSidebar();
    }
  };

  return (
    <ClientOnly>
      <Overlay onClick={handleCloseSidebar} isVisible={isOpenSidebar} />
      <div
        className={classNames({
          "fixed top-0 right-0 bottom-0 w-full sm:w-[380px] h-screen transition-position duration-500 ease-in-out py-4 z-50 bg-black font-strange-dreams text-3xl sm:text-4xl":
            true,
          "-mr-[1000px]": !isOpenSidebar,
        })}
      >
        <div className="h-full rounded-md shadow-2xl p-4 flex flex-col w-full overflow-auto">
          <button
            className="text-red-500 self-end text-4xl mb-8"
            onClick={handleCloseSidebar}
          >
            <XCircleIcon className="w-8 h-8" />
          </button>
          <div className="flex flex-col space-y-10 flex-grow">
            <WalletMultiButton />
            <Link
              href="/admin"
              className="p-3 rounded-2xl bg-stone-900 hidden md:block"
            >
              <KeyIcon className="w-6 h-6 text-stone-300" />
            </Link>
            <div>
              <Link
                className="px-3 uppercase rounded-lg font-bold"
                href="/hunt/active"
                onClick={handleCloseSidebar}
              >
                Hunts
              </Link>
            </div>
            <div>
              <Link
                className="px-3 uppercase rounded-lg font-bold"
                href="/loot-box/active"
                onClick={handleCloseSidebar}
              >
                Lootboxes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
};

export default Sidebar;
