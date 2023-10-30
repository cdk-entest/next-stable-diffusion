import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";

export const space = Space_Grotesk({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "entest.io blog web development on aws",
  description: "entest.io blog web development on aws using NextJS and CDK",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${space.variable} font-sans dark:bg-slate-800`}>
        <Header></Header>
        <div className="dark:bg-slate-800">{children}</div>
        <Footer></Footer>
      </body>
    </html>
  );
}
