/*
   
  Starting point of the application where all the logic of the rounting takes place 
  for every page a route is defined and for that route which page will be rendered
  the page folder will contain every page
 */

// for navigation
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import pages
import LandingPage from "./pages/landingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomeLayout from "./pages/HomeLayout";
import Home from "./pages/Home";
import AddPost from "./pages/AddPost";
import Chat from "./pages/Chat";
import ProtectedRoute from "./ProtectedRoute";
import PostDetails from "./pages/PostDetails";
import SettingsPage from "./pages/Settings";
import PersonalityTestPage from "./pages/PersonalityTestPage";
import FriendList from "./pages/FriendList";
import ForgotPassword from "./pages/ForgotPasswordPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        {/* each compoent of route has a path and a component
         e.g if you go to localhost:5173/login login page will be rendered
         similar to all the pages
         top level routing
         */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Home routes */}
        {/* A custom Protected route component which checks if user is logged in if he is go to home screen else navigate to login page */}
        {/* nested routing */}
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/personality-test" element={<PersonalityTestPage />} />
          <Route path="home" element={<Home />} />
          <Route path="add-post" element={<AddPost />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:id" element={<Chat />} />
          <Route path="postDetails/:id" element={<PostDetails />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="friends" element={<FriendList />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
