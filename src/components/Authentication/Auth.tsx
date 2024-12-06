"use client";

import { useState } from "react";
import SignIn from "./SignIn";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setMode("signin")}
          className={`px-4 py-2 text-sm font-medium ${
            mode === "signin"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`px-4 py-2 text-sm font-medium ${
            mode === "signup"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sign Up
        </button>
      </div>
      <SignIn />
    </div>
  );
}
