import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnMyShow — Experiential Education & Conference Platform",
  description:
    "Discover, attend, and organize world-class educational events across the nation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
