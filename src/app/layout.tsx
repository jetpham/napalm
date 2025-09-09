import "~/styles/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import Header from "./components/header";
import Footer from "./components/footer";

export const metadata: Metadata = {
  title: "Napalm",
  description: "A CTF platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  other: {
    "apple-mobile-web-app-title": "Napalm",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
