import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL('https://bfactory.app'),
  title: {
    default: "Biryani Factory - Authentic Hyderabadi Biryani",
    template: "%s | Biryani Factory",
  },
  description: "Order the best authentic Hyderabadi Dum Biryani online from Biryani Factory. Serving Tirupati, Bachupally, and Kondapur. Fast delivery and premium taste.",
  keywords: ["Biryani", "Hyderabadi Biryani", "Food Delivery", "Tirupati", "Hyderabad", "Dum Biryani", "Biryani Factory"],
  authors: [{ name: "Biryani Factory" }],
  creator: "Biryani Factory",
  publisher: "Biryani Factory",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bfactory.app",
    title: "Biryani Factory - Authentic Hyderabadi Biryani",
    description: "Order the best authentic Hyderabadi Dum Biryani online from Biryani Factory. Serving Tirupati, Bachupally, and Kondapur.",
    siteName: "Biryani Factory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Biryani Factory - Authentic Hyderabadi Biryani",
    description: "Order the best authentic Hyderabadi Dum Biryani online from Biryani Factory.",
    creator: "@biryanifactory",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { Navbar } from "@/components/navbar";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { Toaster } from "@/components/ui/sonner";

import { Footer } from "@/components/footer";
import { LocationProvider } from "@/components/location/LocationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* <LocationProvider /> */}
        <Navbar />
        {children}
        <Footer />
        <CartSidebar />
        <Toaster />
      </body>
    </html>
  );
}
