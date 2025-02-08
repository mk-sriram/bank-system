"use client";
import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 tracking-tight"
            target="_blank"
          >
            mksriram
          </Link>

          {/* Primary nav links */}
          <nav className="flex space-x-6">
            <Link
              href="https://www.mksriram.com/#experience"
              className="text-gray-700 hover:text-gray-900 transition"
              target="_blank"
            >
              Why me
            </Link>
            <Link
              href="/about-me"
              className="text-gray-700 hover:text-gray-900 transition"
              target="_blank"
            >
              About me
            </Link>
          </nav>
        </div>

        {/* Right side: My Portfolio Button */}
        <Link
          href="https://www.mksriram.com/"
          target="_blank"
          className="
            px-5
            py-2
            bg-orange-500
            hover:bg-orange-600
            text-white
            font-medium
            rounded-md
            transition-colors
            duration-200
            flex items-center justify-center
          "
        >
          My Portfolio
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
