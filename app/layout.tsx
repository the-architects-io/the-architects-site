import "./globals.css";
import { Inter } from "next/font/google";

import { ContextProvider } from "@/providers/context-provider";
import { SidebarProvider } from "@/hooks/sidebar";
import { AdminProvider } from "@/hooks/admin";

import classNames from "classnames";
import Toaster from "@/features/toasts/toaster";
import { DebugModeProvider } from "@/hooks/debug-mode";
import Navbar from "@/features/navigation/navbar";

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
  return (
    <html lang="en">
      <body className={classNames([inter.className, "relative"])}>
        <ContextProvider>
          <DebugModeProvider>
            <SidebarProvider>
              <AdminProvider>
                {children}
                <Navbar />
                <Toaster />
                {/* <Sidebar /> */}
              </AdminProvider>
            </SidebarProvider>
          </DebugModeProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
