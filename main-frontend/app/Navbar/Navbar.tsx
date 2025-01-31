"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const { session, setSession } = useSession();
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/Login");
  };

  const handleCartClick = () => {
    router.push("/cart");
  };

  const handleLogoutClick = async () => {
    try {
      await fetch("http://localhost:4000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setSession(null);
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              MyStore
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/50">
                Home
              </Button>
            </Link>
            <Link href="/page1">
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/50">
                Page1
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/50">
                Products
              </Button>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCartClick}
              className="text-zinc-300 hover:bg-zinc-800/50 hover:text-white relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {/* Add cart count badge here if needed */}
              {/* <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span> */}
            </Button>

            {session ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-zinc-300">
                  <User className="h-5 w-5" />
                  <span className="font-medium">
                    {session.user.email.split("@")[0]}
                  </span>
                </div>
                <Button
                  onClick={handleLogoutClick}
                  variant="destructive"
                  className="hover:bg-red-700 transition-colors"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLoginClick}
                className="bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;