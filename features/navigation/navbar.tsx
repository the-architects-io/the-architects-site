import { useAdmin } from "@/hooks/admin";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import Link from "next/link";
import {
  Bars3CenterLeftIcon,
  Bars3Icon,
  BugAntIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useDebugMode } from "@/hooks/debug-mode";

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { isDebugMode, setIsDebugMode } = useDebugMode();
  const { isAdmin } = useAdmin();

  return (
    <div className="-mb-20 h-20 md:h-16 md:-mb-16 bg-stone-900 shadow-2xl z-100 absolute top-0 w-full">
      <div className="flex h-full w-full items-center justify-between gap-4 py-2 max-w-6xl mx-auto px-4">
        <Link href="/" className="md:hidden">
          <Image
            className="h-12 w-14 flex-none flex-shrink-0"
            src="/images/sodead-logo.png"
            alt="SoDead Logo"
            height={40}
            width={40}
          />
        </Link>
        <div className="space-x-2 md:space-x-8 items-center text-base md:text-xl tracking-wider hidden md:flex font-strange-dreams">
          <Link href="/" className="flex items-center justify-center flex-none">
            <Image
              className="h-12 hidden md:block mr-2 md:mr-8"
              src="/images/sodead-long-logo.png"
              alt="SoDead Logo"
              height={42}
              width={100}
            />
          </Link>
          <Link href="/hunt/active">Hunts</Link>
          <Link href="/loot-box/active">Lootboxes</Link>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsDebugMode(!isDebugMode)}
                className="p-3 rounded-2xl hidden md:block"
              >
                <BugAntIcon className="w-6 h-6 text-stone-300" />
              </button>
              <Link href="/admin" className="p-3 rounded-2xl hidden md:block">
                <KeyIcon className="w-6 h-6 text-stone-300" />
              </Link>
            </>
          )}
          <div className="hidden md:block">
            <WalletMultiButton />
          </div>
        </div>
        <button onClick={toggleSidebar} className="md:hidden">
          <Bars3Icon className="w-8 h-8 text-stone-300" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
