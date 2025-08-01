// Import necessary dependencies for component functionality
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Avatar from "../components/Avatar";
import { useAuth } from "@clerk/clerk-react";

// PostDetails component - Displays visitors of a specific post
const PostDetails = () => {

  // from clerk
  const { isLoaded, getToken } = useAuth();

  const navigate = useNavigate(); // Navigation utility

  const { id } = useParams(); // Extract post ID from URL parameters
  const [visitors, setVisitors] = useState([]); // Store list of post visitors its array
  const [loading, setLoading] = useState(true); // Track loading state

  console.log("POST ID IS",id);

  // Effect hook to fetch visitors data when component mounts
  useEffect(() => {
    const fetchVisitors = async () => {
      try {

        // API call to get post visitors
        const token = await getToken();
        const response = await fetch(`http://localhost:3000/api/post-details/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const user_details_response = await response.json();
        console.log("USER DETAIL RESPONSE",user_details_response.data);
        const visitor_data = user_details_response.data;

        // alert user if his profile was added to list of visitors
        console.log("PROfile ADDED?",user_details_response.checked);

        // if user profile has been added to list of visitors for the said post
        if(user_details_response.checked)
        {
          alert("Your profile was added and is now visible to other users.");
        }
        
        // set data
        setVisitors(visitor_data);

        // animation stops
        setLoading(false);

      } catch (error) {
        console.error("Error fetching visitors:", error);
        setLoading(false);
      }
    };

    fetchVisitors();
  }, [id]);

  // Handler for saving profile of visitors
  const handleAddFriend = async (visitorId) => {
    try {
      const visit_id = visitorId;
      console.log("visit id of user", visit_id);

      const token2 = await getToken();

      // api call to add user to remembered users list/ saved profiles
      const res = await fetch(`http://localhost:3000/api/remember-user/${visit_id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token2}`
        },
      });
      const db_result = await res.json();
      // on error
      if(db_result.error==="yes")
      {
        alert(db_result.message);
        console.log(db_result.message);
      }
      // success
      else
      {
        if(db_result.message)
        {
          alert(db_result.message);
          console.log(db_result.message);
        }
        if(db_result.user_added_message)
        {
          alert(db_result.user_added_message);
          console.log(db_result.user_added_message);
        }
      }

    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request. Please try again.");
    }
  };

  // Loading spinner display while fetching data
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // Handler for initiating chat with a visitor
  const handleChat = (id) => {
    navigate("/chat", {state: {visitorId: id}});
  };

  // UI Structure:
  // - Back navigation
  // - Visitors list with interaction buttons
  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 relative">
      {/* Back navigation section */}
      <div className="w-full flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
          aria-label="Go back"
        >
          <HiArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#92400e]">
          Visitors
        </h1>
      </div>

      {/* Visitors list */}
      <div className="overflow-y-auto pb-4 space-y-6 h-[80vh] px-4 w-full">
        {visitors.map((visitor) => (
          <div
            key={visitor.id}
            className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all ease-in-out"
          >
            {/* Visitor information with avatar */}
            <div className="flex items-center gap-6">
              <Avatar
                username={visitor.username}
                personality={visitor.personality}
              />
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  {visitor.username}
                </p>
                <p className="text-sm text-gray-500">{visitor.personality}</p>

              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              {!visitor.isFriend && (
                <button
                  onClick={() => handleAddFriend(visitor.id)}
                  className="px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#d97706] transition ease-in-out duration-300"
                >
                  Save Profile
                </button>
              )}
              
              <button
                onClick={() => handleChat(visitor.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition ease-in-out duration-300"
              >
                Chat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostDetails;
