import { Roboto } from "next/font/google";
import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

// const geistSans = Geist({ subsets: ["latin"] });
// const geistMono = Geist_Mono({ subsets: ["latin"] });

const roboto = Roboto({
  weight: ["400", "500", "700"], // Regular, Medium, Bold
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diabetes Detection System",
  description:
    "Advanced AI-powered diabetes detection system for healthcare professionals",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} ${roboto.className}`}>
        <AuthProvider>
          <Navigation />
          {children}
          <Footer />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
