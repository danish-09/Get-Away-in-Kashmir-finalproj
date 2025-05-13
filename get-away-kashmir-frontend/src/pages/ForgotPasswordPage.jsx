// Import necessary dependencies for state management and routing
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// ForgotPassword component - Handles password reset flow with email and OTP verification
const ForgotPassword = () => {

  // getting token from useAuth
  const { isLoaded, getToken, isSignedIn } = useAuth();

  // navigation hook
  const navigate = useNavigate();

  // signin object
  const { signIn, setActive } = useSignIn();

  // State management for form fields and UI control
  const [email, setEmail] = useState(""); // Store user email
  const [message, setMessage] = useState(""); // Display status messages
  const [otpSent, setOtpSent] = useState(false); // Toggle between email and OTP forms
  const [otp, setOtp] = useState(""); // Store OTP input
  const [newPassword, setNewPassword] = useState(""); // Store new password
  const [repeatPassword, setRepeatPassword] = useState(""); // Confirm new password


  //useeffect for issigned up

  useEffect(() => {
    const after_reset_login = async() => {
      
      if(isSignedIn)
      {
        // jwt session token
        const token = await getToken();
        console.log("reset pass token jwt",token);
        // db call to backend
        const response = await fetch("http://localhost:3000/api/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // jwt session token
          },
          // no data to send to backend
        });
        const backend_result = await response.json();
        console.log("result from BACKEND during reset password: ",backend_result);
        if(backend_result.error)
        {
          setMessage(`${backend_result.error}`)
          return;
        }
        setMessage("Password reset successfull. Logging you in");
        setTimeout(() => {
          // window.location is a browser API                                   
          navigate("/home")
        }, 2000);
        
      }
    }
    // calling function
    after_reset_login();
  },[isSignedIn])


  // Handle email submission and OTP generation
  // Validates email format and triggers OTP sending process
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmail) {
      alert("Please enter a valid email address.");
      return;
    }

    // no time to read the message
    setMessage("Sending OTP...");

    try {
      //API CALL HERE
      // Simulated API call to send OTP
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ email }),
      // });
      // const data = await response.json();

      // Clerk successful OTP send
      // this will allow the render of other form 
      const res = await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      console.log("Reset code sent to email", res);
      setOtpSent(true);
      setMessage("OTP has been sent to your email.");

    } catch (error) {
      setMessage("Failed to send OTP. Please try again.");
      console.error("Error sending OTP:", error);
    }
  };

  // Handle password reset after OTP verification
  // Validates OTP and updates password in the system
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !repeatPassword) {
      alert("Please fill all the fields.");
      return;
    }

    if (newPassword !== repeatPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      //API CALL HERE
      // Simulated API call to verify OTP and reset password
      // const response = await fetch('/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email,
      //     otp,
      //     newPassword
      //   }),
      // });
      // const data = await response.json();

      // Simulate successful password reset
      const res = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code:otp,
        password: newPassword,
      });
      
      if (res.status === "complete" && isLoaded) {
        console.log("Password reset successfull!");
        console.log("after resetting session id is: ",res.createdSessionId);

        // sets the session
        await setActive({session:res.createdSessionId});
    
        

        
        

      } else {
        console.log("Password reset unsuccessfull", res);
        setMessage("Password reset Unsuccessfully.");
      }
                              
      // WHY NOT USE NAVIGATE HERE ALSO WITH REPLACE:TRUE For actions that shouldn't be reversible 
      // callback function triggered after 2000ms 2secs 
      

    } catch (error) {
      setMessage("Failed to reset password. Please try again.");
      console.error("Error resetting password:", error);
    }
  };

  // UI Structure:
  // - Full-screen background with login image
  // - Centered white card for form content
  // - Conditional rendering between email and reset forms
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/login-background.jpg')] bg-cover bg-center bg-no-repeat relative px-4 text-white">
      {/* Main form container with white background */}
      <div className="relative bg-white text-gray-800 shadow-xl rounded-2xl p-10 w-full max-w-md z-10">
        {/* Dynamic title based on current step */}
        <h2 className="text-3xl font-bold text-center mb-6">
          {otpSent ? "Reset Password" : "Forgot Password"}
        </h2>

        {/* Conditional rendering of forms based on OTP status   if otp is not sent*/}
        {!otpSent ? (
          // Email submission form
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email" // htmlfor links the label to the input its bet practice , helps screen readers
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Enter your email"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#D2691E] text-white py-2 rounded-lg font-semibold hover:bg-[#A0522D] transition"
            >
              Send OTP
            </button>
          </form>
        ) : (
          // Password reset form with OTP verification
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Enter OTP"
                required
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="New Password"
                required
              />
            </div>
            <div>
              <label
                htmlFor="repeat-password"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Repeat Password
              </label>
              <input
                type="password"
                id="repeat-password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Repeat Password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#D2691E] text-white py-2 rounded-lg font-semibold hover:bg-[#A0522D] transition"
            >
              Reset Password
            </button>
          </form>
        )}

        {/* Status message display */}
        {/* If message is falsy, it returns false (which React ignores) */}
        
        {message && (
          <p className="text-center text-sm mt-4 text-gray-600">{message}</p>
        )}

        {/* Navigation link back to login page */}
        <div className="text-center mt-4">
          <Link to="/login" className="text-[#D2691E] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
