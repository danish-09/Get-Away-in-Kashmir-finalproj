// Import necessary dependencies for state management and navigation
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useClerk } from "@clerk/clerk-react";

// SettingsPage component - Handles user settings and profile management
const SettingsPage = () => {

  // logout from clerk

  const { signOut } = useClerk();

  // Handler for user logout
  const onLogout = () => {
    localStorage.clear();
    signOut({
      redirectUrl:"/",
    })
    sessionStorage.clear();
  };


  // UI Structure:
  // - Main container with sections for different settings
  // - Logout option
  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl space-y-10 border border-gray-200">
      {/* Page title */}
      <h1 className="text-3xl font-semibold text-[#78350f] text-center">
        Settings
      </h1>


      {/* Logout button */}
      <div className="pt-6 border-t border-gray-200 text-center">
        <button
          onClick={onLogout}
          className="text-[#b91c1c] font-medium hover:underline"
        >
          Logout
        </button>
      </div>
      </div>
    // </div>
  );
};

export default SettingsPage;
