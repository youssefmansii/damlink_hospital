import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DamLink Hospital Dashboard",
  description: "Command center for hospital staff",
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
