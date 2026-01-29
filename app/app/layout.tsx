import type { Metadata } from "next";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import WalletContextProvider from "@/components/WalletContextProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Mini Meta DAO",
  description: "Governance through conviction. Prediction market-driven decisions on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletContextProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </WalletContextProvider>
      </body>
    </html>
  );
}
