
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeroVex",
  description: "VeroVex Student and Client Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

