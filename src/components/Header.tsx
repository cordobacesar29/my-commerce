import React from "react";
import { UserHeaderSection } from "./UserHeaderSection";

export default function Header() {
  return (
    <div className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex items-center gap-3">
        <img src="/ramon_logo.svg" alt="Ramón Logo" className="h-10 w-10 bg-amber-50 border-2 border-b-cyan-900 rounded-full"  />
        <h1 className="text-2xl font-bold">Ramón Store</h1>

      </div>
      <div className="mt-2 text-sm text-gray-400">
        {/* {username}
        <Avatar/> */}
        <UserHeaderSection />
      </div>
    </div>
  );
}
