"use client";
import AdminToolbarContent from "@/features/admin/tools/admin-toolbar-content";
import { useAdmin } from "@/hooks/admin";
import classNames from "classnames";
import { useState } from "react";

export const AdminToolbar: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAdmin) return <></>;

  return (
    <>
      <div
        className={classNames([
          "w-full max-h-64 fixed bg-transparent pointer-events-none",
          "transition-all duration-300  ease-out",
          "transform translate-y-full z-50",
          isOpen ? "bottom-72" : "bottom-10",
        ])}
      >
        <div className="overflow-y-hidden">
          <button
            className="text-stone-200 hover:text-sky-300 bg-gray-700 px-6 pt-2 pb-4 border-t rounded-lg border-gray-500 absolute top-0 left-4 pointer-events-auto"
            onClick={() => setIsOpen(!isOpen)}
          >
            admin tools
          </button>
          <AdminToolbarContent />
        </div>
      </div>
    </>
  );
};

export default AdminToolbar;
