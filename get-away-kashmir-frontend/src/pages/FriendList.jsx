// Import necessary dependencies for component functionality
import React, { useState, useEffect } from "react";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import Avatar from "../components/Avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

// Saved Profiles - Displays a grid of user's saved profiles with chat functionality
function FriendList() {

  const { isLoaded, getToken } = useAuth();

  // State management for friends data and loading state

  const [friends, setFriends] = useState([]); // Store list of friends
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Effect hook to fetch saved profiles data when component mounts
  useEffect(() => {
    const fetchFriends = async () => {
      // loading animation start
      setIsLoading(true);
      try {
        
        // api call to backend to get remembered users
        const token = await getToken();
        const response = await fetch(`http://localhost:3000/api/remembered-user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        // on error
        if(result.error==="yes")
        {
          alert(result.message);
          console.log(result.message);
        }
        // success
        else
        {
          const r_users = result.data
          console.log(r_users);
          console.log(result.message);
          setFriends(r_users);

          // loading animation stops
          setIsLoading(false);

        }


      } catch (error) {
        console.error("Error fetching remembered users:", error);
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handlefriendchat = (id) => {
    // invokes when saved profile is clicked
    navigate("/chat", {state: {savedId: id }});
  }
  
  // UI Structure:
  // - Main container with responsive grid layout
  // - Loading spinner while data is being fetched
  // - Profile card with avatar, name, and personality type
  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-md rounded-xl p-4 space-y-4">
      {/* Section title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Profiles</h2>

      {/* Conditional rendering based on loading state */}
      {isLoading ? (
        // Loading spinner animation
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        </div>
      ) : (
        // Responsive grid of profile cards
        <div className="overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map through array to create individual cards */}
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-md hover:bg-gray-100 cursor-pointer transition ease-in-out"
              onClick={() => 
                handlefriendchat(friend.id)
              }
            >
              {/* profile avatar component */}
              <Avatar username={friend.remembered_username} personality={friend.remembered_personality} />
              
              {/* profile information */}
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-700">
                  {friend.remembered_username}
                </span>
                <span className="text-sm text-gray-500">
                  {friend.remembered_personality}
                </span>
              </div>
              
              {/* Chat icon */}
              <ChatBubbleOvalLeftIcon className="h-6 w-6 text-amber-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendList;
