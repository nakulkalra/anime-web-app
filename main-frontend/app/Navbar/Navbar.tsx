"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Fetch session data from the API
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/check-session', {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent with the request
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ email: data.user.email }); // Assume API returns `{ email: string }`
        } else {
          setUser(null); // User is not logged in
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null); // Handle API errors gracefully
      }
    };

    checkSession();
  }, []);

  const handleLoginClick = () => {
    window.location.href = `/Login`;
  };

  const handleLogoutClick = async () => {
    try {
      // Call API to log out the user
      await fetch('http://localhost:4000/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null); // Clear user state
    } catch (error) {
      console.error('Error logging out:', error);
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
          <Link href="/page2" className="text-white hover:text-gray-400">
            Page2
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-white">Welcome, {user.email}</span>
              <Button onClick={handleLogoutClick} className="bg-red-800 text-white px-4 py-2 rounded hover:bg-red-500">
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={handleLoginClick} className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-500">
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
