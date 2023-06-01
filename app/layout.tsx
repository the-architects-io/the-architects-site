import "./globals.css";
import { Inter } from "next/font/google";

import Sidebar from "@/features/navigation/sidebar";
import { ContextProvider } from "@/providers/context-provider";
import { SidebarProvider } from "@/hooks/sidebar";
import { AdminProvider } from "@/hooks/admin";
import dynamic from "next/dynamic";
import classNames from "classnames";
import Toaster from "@/features/toasts/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "The Architects",
  description: "Building Web 3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const Navbar = dynamic(() => import("@/features/navigation/navbar"), {
    ssr: false,
  });
  return (
    <html lang="en">
      <body className={classNames([inter.className, "relative"])}>
        <ContextProvider>
          <SidebarProvider>
            <AdminProvider>
              {children}
              <Navbar />
              <Toaster />
              {/* <Sidebar /> */}
            </AdminProvider>
          </SidebarProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
