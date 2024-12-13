import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";
import BackToTop from "@/components/ui/BackToTop";
import { SpeedInsights } from "@vercel/speed-insights/next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Kidshive",
  description: "Nursery Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          src="https://static.elfsight.com/platform/platform.js"
          async
        ></script>
      </head>
      <body
        className={`${poppins.variable} min-h-screen flex flex-col font-sans antialiased`}
      >
        <SpeedInsights />
        <AuthProvider>
          <Navbar />
          <main className="pt-16 flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
        <Toaster />
        <BackToTop />
      </body>
    </html>
  );
}
