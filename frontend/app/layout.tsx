import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LMS - Online Learning Platform",
    template: "%s | LMS",
  },
  description:
    "A modern learning management system for instructors and students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                "bg-white border border-neutral-200 text-neutral-800 shadow-sm",
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
