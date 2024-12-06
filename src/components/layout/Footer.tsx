import Link from "next/link";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold">Kidshive</h3>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Kidshive. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="h-6 w-6 hover:text-pink-500 transition-colors" />
            </Link>
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-6 w-6 hover:text-blue-500 transition-colors" />
            </Link>
            <Link
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-6 w-6 hover:text-green-500 transition-colors" />
            </Link>
          </div>

          <div className="text-center md:text-right space-x-4">
            <Link href="/privacy-policy" className="text-sm hover:underline">
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-sm hover:underline"
            >
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
