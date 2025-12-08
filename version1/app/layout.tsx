import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "NexaPoll - Build and Govern DAOs with Confidence",
  description: "Create decentralized autonomous organizations, manage treasuries, propose governance changes, and vote on the future of your community. All powered by smart contracts and blockchain technology.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const headersObj = await headers();
  const cookies = headersObj.get('cookie')
  
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <ContextProvider cookies={cookies}>
          <Header />
          {children}
          <Footer />
          {/* <Toaster /> */}
        </ContextProvider>
      </body>
    </html>
  );
}
