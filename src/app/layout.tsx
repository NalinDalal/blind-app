import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import "./globals.css";
import type React from "react";
import { Toaster } from "react-hot-toast";
import Providers from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blind App",
  description: "Anonymous Community App for College Students",
};

/**
 * Application root layout that applies global fonts, wraps content with app providers, and renders the site header.
 *
 * @param children - The page or component content to render inside the layout.
 * @returns The root HTML structure containing the body with providers, header, and the provided children.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} antialiased noise-overlay`}
      >
        <Providers>
          <Toaster
            position={"top-right"}
            reverseOrder
            toastOptions={{
              className: "",
              duration: 5000,
              removeDelay: 1000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "green",
                  secondary: "black",
                },
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
