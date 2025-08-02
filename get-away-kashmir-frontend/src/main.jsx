// main entry point of the app used by react to inject the app component to the index.html

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";  // imports tailwind css
import App from "./App.jsx";
import { ClerkProvider } from '@clerk/clerk-react'
// import { GoogleOAuthProvider } from "@react-oauth/google";

// clerk key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
// const CLIENT_ID = "159516873519-e4lqbs3t2jjojofkojurl5obv73e0oq1.apps.googleusercontent.com";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}


createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* ClerkProvider makes authentication globally accessible*/}
    {/* <GoogleOAuthProvider clientId={CLIENT_ID}> */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
    </ClerkProvider>
    {/* </GoogleOAuthProvider> */}
    
  </StrictMode>
);
