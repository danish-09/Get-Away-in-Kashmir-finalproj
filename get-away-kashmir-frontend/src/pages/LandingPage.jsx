import React from "react";

/*
main landing page
hastwo buttons
get started - will navigate to the registration page
login - will mavigate to the login page
 */

// hook for navigation
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  //navigator
  const navigate = useNavigate();

  return (
    <div className="min-h-screen  bg-cover bg-center bg-no-repeat relative px-4 flex flex-col items-center justify-center text-white">
      {/* background image */}
      <img
        src="/background.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative text-center z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg ">
          Get-Away in Kashmir
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl text-white/90">
          Discover hidden destinations, meet fellow travelers, and plan your next
          adventure in Kashmir. Share your trips, find companions,
          and make memories.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 justify-center items-center w-full">
          {/* Sign Up Button */}
          <button
            onClick={() => navigate("/signup")}
            className="bg-amber-600 w-full sm:w-3/12 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-800 transition"
          >
            Get Started
          </button>

          {/* Login Button */}
          <button
            onClick={() => navigate("/login")}
            className="bg-amber-700 w-full sm:w-3/12 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-900 transition"
          >
            Login
          </button>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
