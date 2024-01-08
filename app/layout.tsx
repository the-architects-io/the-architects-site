import "./globals.css";
import { Inter } from "next/font/google";

import { ContextProvider } from "@/providers/context-provider";
import { SidebarProvider } from "@/hooks/sidebar";
import { AdminProvider } from "@/hooks/admin";

import classNames from "classnames";
import Toaster from "@/features/toasts/toaster";
import { DebugModeProvider } from "@/hooks/debug-mode";
import Navbar from "@/features/navigation/navbar";
import AdminToolbar from "@/features/admin/tools/admin-toolbar";
import GoogleAnalytics from "@/features/google-analytics";
import { GA_TRACKING_ID } from "@/constants/constants";
import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import { ClusterProvider } from "@/hooks/cluster";

const inter = Inter({ subsets: ["latin"] });

const createPageMetadata = (): Metadata => ({
  title: "The Architects",
  description: "Closing the loop",
});

export const metadata: Metadata = createPageMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={classNames([inter.className, "relative"])}>
        <ClusterProvider>
          <ContextProvider>
            <DebugModeProvider>
              <SidebarProvider>
                <AdminProvider>
                  {children}
                  <Navbar />
                  <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID as string} />
                  <Analytics />

                  <Toaster />
                  {/* <Sidebar /> */}
                  <AdminToolbar />
                </AdminProvider>
              </SidebarProvider>
            </DebugModeProvider>
          </ContextProvider>
        </ClusterProvider>
      </body>
    </html>
  );
}
