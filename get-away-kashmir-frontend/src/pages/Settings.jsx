// Import necessary dependencies for state management and navigation
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useClerk } from "@clerk/clerk-react";

// SettingsPage component - Handles user settings and profile management
const SettingsPage = () => {

  // logout from clerk

  const { signOut } = useClerk();

  // State management for form fields and user data
  const [username, setUsername] = useState(localStorage.getItem("username")); // Current username
  const [password, setPassword] = useState(""); // New password
  const [oldPassword, setOldPassword] = useState(""); // Current password
  const [personalityTaken, setPersonalityTaken] = useState(false); // Personality test status
  const navigate = useNavigate(); // Navigation utility

  // Check if personality test has been taken on component mount
  useEffect(() => {
    if (localStorage.getItem("personalityTaken")) {
      setPersonalityTaken(true);
    }
  }, []);

  // API function for updating username
  const updateUsername = async () => {
    //API CALL HERE
    // const res = await fetch("/api/update-username", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username }),
    // });
    // const data = await res.json();
    // if (data.success) {
    //   localStorage.setItem("username", data.updated.username);
    // } else {
    //   alert(data.message || "Failed to update username.");
    // }
  };

  // API function for updating password
  const updatePassword = async () => {
    //API CALL HERE
    // const res = await fetch("/api/update-password", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ oldPassword, newPassword: password }),
    // });
    // const data = await res.json();
    // if (!data.success) {
    //   alert(data.message || "Failed to update password.");
    // }
  };

  // Handler for user logout
  const onLogout = () => {
    localStorage.clear();
    signOut({
      redirectUrl:"/",
    })
    sessionStorage.clear();
  };

  // Form submission handler for username update
  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    await updateUsername();
    alert("Username updated!");
  };

  // Form submission handler for password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (!oldPassword) {
      alert("Please enter your old password.");
      return;
    }
    await updatePassword();
    alert("Password updated!");
    setPassword("");
    setOldPassword("");
  };

  // Handler for navigating to personality test
  const handleTakePersonalityTest = () => {
    alert("Redirecting to personality test...");
    navigate("/personality-test");
  };

  // UI Structure:
  // - Main container with sections for different settings
  // - Forms for username and password updates
  // - Personality test section
  // - Logout option
  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl space-y-10 border border-gray-200">
      {/* Page title */}
      <h1 className="text-3xl font-semibold text-[#78350f] text-center">
        Settings
      </h1>
      {/* <div className="">

      

      Username update form */}
      {/* <form onSubmit={handleUsernameUpdate} className="space-y-4 mb-2">
        <h2 className="text-xl font-medium text-gray-800">Update Username</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
          placeholder="Enter new username"
        />
        <button
          type="submit"
          className="bg-[#d97706] text-white px-4 py-2 rounded-lg hover:bg-[#b45309] transition"
        >
          Update Username
        </button>
      </form> */}

      {/* Password update form */}
      {/* <form
        onSubmit={handlePasswordUpdate}
        className="space-y-4 pt-2 border-t border-gray-200 mb-2"
      >
        <h2 className="text-xl font-medium text-gray-800">Update Password</h2>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
          placeholder="Enter old password"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
          placeholder="Enter new password"
        />
        <button
          type="submit"
          className="bg-[#d97706] text-white px-4 py-2 rounded-lg hover:bg-[#b45309] transition"
        >
          Update Password
        </button>
      </form> */}

      {/* Personality test section */}
      {/* <div className="pt-4 border-t border-gray-200 mb-2">
        <p className="text-gray-700 mb-2">
          {personalityTaken
            ? "Retake your personality test."
            : "You haven't taken your personality test yet."}
        </p>
        <button
          onClick={handleTakePersonalityTest}
          className="bg-[#92400e] text-white px-4 py-2 rounded-lg hover:bg-[#78350f] transition"
        >
          {personalityTaken ? "Retake" : "Take personality test"}
        </button>
      </div> */}

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
