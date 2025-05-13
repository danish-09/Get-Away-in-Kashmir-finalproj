// Import necessary dependencies for component functionality
import React, { useState, useEffect } from "react";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import Avatar from "../components/Avatar";
import { useNavigate } from "react-router-dom";

// FriendList component - Displays a grid of user's friends with chat functionality
function FriendList() {
  // State management for friends data and loading state
  const [friends, setFriends] = useState([]); // Store list of friends
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Effect hook to fetch friends data when component mounts
  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        //API CALL HERE
        //  this would be an API call
        // const userId = localStorage.getItem('userId');
        // const response = await fetch(`/api/users/${userId}/friends`, {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // const data = await response.json();

        // Simulating API response with dummy data
        //delete this after adding API
        const dummyFriends = [
          { id: 1, name: "Danish Najeeb", personality: "ISTJ" },
          { id: 2, name: "Sheikh Mumin Ahmad", personality: "ISFP" },
          { id: 3, name: "Mohammad Ayman", personality: "ISTP" },
        ];

        // Simulate API delay
        setTimeout(() => {
          setFriends(dummyFriends);
          setIsLoading(false);
        }, 500);
        //delete till here and uncomment the below code
        // setFriends(data);
        // setIsLoading(false);
      } catch (error) {
        console.error("Error fetching friends:", error);
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // UI Structure:
  // - Main container with responsive grid layout
  // - Loading spinner while data is being fetched
  // - Friend cards with avatar, name, and personality type
  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-md rounded-xl p-4 space-y-4">
      {/* Section title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Friends</h2>

      {/* Conditional rendering based on loading state */}
      {isLoading ? (
        // Loading spinner animation
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        </div>
      ) : (
        // Responsive grid of friend cards
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map through friends array to create individual cards */}
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-md hover:bg-gray-100 cursor-pointer transition ease-in-out"
              onClick={() => {
                navigate(`/chat/${friend.id}`); // Navigate to individual chat
              }}
            >
              {/* Friend's avatar component */}
              <Avatar username={friend.name} personality={friend.personality} />
              
              {/* Friend's information */}
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-700">
                  {friend.name}
                </span>
                <span className="text-sm text-gray-500">
                  {friend.personality}
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
