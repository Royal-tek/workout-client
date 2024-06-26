import ReactQueryProvider from "@/components/Providers/ReactQueryProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Provider from "@/components/Providers/Provider";
// import Loader from "@/components/Providers/Loader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MaxUp",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: // modal,
{
  children: React.ReactNode;
  // modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className=" bg-zinc-950 overflow-x-hidden ">
        <Toaster position="top-center" />
        <ReactQueryProvider>
          <Provider>
            {children}
            {/* {modal} */}
          </Provider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
