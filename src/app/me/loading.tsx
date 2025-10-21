"use client";

import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Animated dual spinner */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer ring */}
        <div className="absolute w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin-slow"></div>
        {/* Inner ring */}
        <div className="absolute w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin-reverse-slow"></div>
        {/* Center icon */}
        <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
      </div>

      {/* Loading text */}
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
        Loading, please wait...
      </p>
    </div>
  );
}
