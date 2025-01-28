"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/SessionContext";
import { ShoppingCart } from "lucide-react";

const Navbar: React.FC = () => {
  const { session, setSession } = useSession();

  const handleLoginClick = () => {
    window.location.href = `/Login`; 
  };

  const handleCartClick = () => {
    window.location.href = `/cart`; 
  };

  const handleLogoutClick = async () => {
    try {
      // Call API to log out the user
      await fetch("http://localhost:4000/api/logout", {
        method: "POST",
        credentials: "include", // Include cookies with the request
      });

      setSession(null); // Clear session context
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-zinc-950 p-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-white text-xl font-bold">
          <span>MyLogo</span>
        </div>

        {/* Navigation Links */}
        <div className="space-x-4">
          <Link href="/" className="text-white hover:text-gray-400">
            Home
          </Link>
          <Link href="/page1" className="text-white hover:text-gray-400">
            Page1
          </Link>
          <Link href="/products" className="text-white hover:text-gray-400">
            Products
          </Link>
        </div>
        <div>
          <Button variant="default" onClick={handleCartClick}>
          <ShoppingCart className="h-5 text-white"/>
          </Button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="text-white">Welcome, {session.user.email}</span>
              <Button
                onClick={handleLogoutClick}
                className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-500"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              onClick={handleLoginClick}
              className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-500"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
