import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";



// ProtectedRoute component wraps routes that require authentication
// It checks if the user is logged in before rendering the protected content
const ProtectedRoute = ({ children }) => {

  // from clerk
const { isSignedIn, isLoaded } = useUser();


 if (!isSignedIn) {
    // Navigate component from react-router-dom handles the redirect
    // 'replace' prop replaces the current history entry instead of adding a new one

    // navigates to the login page if not signedIn
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
