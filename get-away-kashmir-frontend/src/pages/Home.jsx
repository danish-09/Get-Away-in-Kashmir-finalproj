// Import necessary React hooks and components
import React, { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import { useNavigate } from "react-router-dom";
import { ArrowRightCircle } from "lucide-react"; // Icon component for the visit button

// Home component to display all available trips
const Home = () => {

  // State to store all posts/trips // its an array for a reason  
  const [posts, setPosts] = useState([]);
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Effect hook to fetch posts when component mounts yep yep yep
  useEffect(() => {
    const fetchPosts = async () => {
      // In a real application, this would be an API call to your backend
      // Example API endpoint: GET /api/posts
      // const response = await fetch('http://your-api/posts', {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      // const data = await response.json();

      //dummy data simulating API response
      const data = [
        // Dummy post 1
        {
          id: 1,
          title: "Trip to Gulmarg",
          description:
            "Join me on a snow adventure this December. Let's make memories!",
          name: "Danish Najeeb",
          // image: "https://randomuser.me/api/portraits/men/32.jpg",
          personality: "ISTJ",
          photos: [
            "https://images.pexels.com/photos/25786709/pexels-photo-25786709/free-photo-of-view-of-a-road-between-autumnal-trees.jpeg",
            "https://images.pexels.com/photos/19147506/pexels-photo-19147506/free-photo-of-auto-rickshaw-on-road-in-autumn.jpeg",
          ],
          location: "Gulmarg, Kashmir",
          date: "December 15 2025",
        },
        // Dummy post 2
        {
          id: 2,
          title: "Exploring Pahalgam",
          description: "Looking for a group to explore Pahalgam in January.",
          name: "Sheikh Mumin Ahmad",
          // image: "https://randomuser.me/api/portraits/women/44.jpg",
          personality: "ISFP",
          photos: [
            "https://images.pexels.com/photos/25786709/pexels-photo-25786709/free-photo-of-view-of-a-road-between-autumnal-trees.jpeg",
            "https://images.pexels.com/photos/19147506/pexels-photo-19147506/free-photo-of-auto-rickshaw-on-road-in-autumn.jpeg",
          ],
          location: "Pahalgam, Kashmir",
          date: "January 10 2025",
        },
        // Dummy post 3
        {
          id: 3,
          title: "Srinagar Flower Festival",
          description: "Join me for the famous Flower Festival in April.",
          name: "Mohammad Ayman",
          // image: "https://randomuser.me/api/portraits/men/76.jpg",
          personality: "ISTP",
          photos: [
            "https://images.pexels.com/photos/25786709/pexels-photo-25786709/free-photo-of-view-of-a-road-between-autumnal-trees.jpeg",
            "https://images.pexels.com/photos/19147506/pexels-photo-19147506/free-photo-of-auto-rickshaw-on-road-in-autumn.jpeg",
          ],
          location: "Srinagar, Kashmir",
          date: "April 5 2025",
        },
        // Dummy post 4
        {
          id: 4,
          title: "Lets go to thajwas",
          description: "Join me , let's explore Thajwas in Sonamarg",
          name: "Imran Shah",
          // image: "https://randomuser.me/api/portraits/men/76.jpg",
          personality: "INTJ",
          photos: [
            "https://images.pexels.com/photos/25786709/pexels-photo-25786709/free-photo-of-view-of-a-road-between-autumnal-trees.jpeg",
            "https://images.pexels.com/photos/19147506/pexels-photo-19147506/free-photo-of-auto-rickshaw-on-road-in-autumn.jpeg",
          ],
          location: "Sonamarg, Kashmir",
          date: "May 5 2025",
        },
      ];
      //API CALL HERE
      // Commented out actual API implementation for future use
      // try {
      //   const response = await fetch("/api/trips");

      //   const result = await response.json();

      //   // result={
      //   //   success:true,
      //   //   data:data
      //   // }

      //   if (result.success) {
      //     // setPosts(result.data);
      //   } else {
      //     alert("error getting posts");
      //   }
      // } catch (err) {
      //   console.error("home error:", err);
      //   alert("Something went wrong. Please try again.");
      // }

      // Update state with fetched/dummy data
      setPosts(data);
    };

    // Execute the fetch function
    fetchPosts();
  }, []);

  // Render the component
  return (
    // Main container with full height and background
    <div className="min-h-screen bg-gray-200 px-4 py-6">
      {/* Page title */}
      <h1 className="text-3xl text-center font-bold text-amber-700 mb-8">
        Available Trips
      </h1>

      {/* Scrollable container for posts */}
      <div className="flex flex-col gap-6 items-center overflow-y-auto max-h-[calc(100vh-150px)] px-2">
        {/* Map through posts and render each post card */}
        {posts.map((post) => (
          <div
            key={post.id}
            className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-200"
          >
            {/* User info section with avatar */}
            <div className="flex items-center gap-4 mb-4">
              <Avatar username={post.name} personality={post.personality} />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {post.name}
                </h3>
                <p className="text-sm text-gray-500">{post.personality}</p>
              </div>
            </div>

            {/* Post title */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {post.title}
            </h2>

            {/* Horizontal scrollable photo gallery */}
            <div className="flex overflow-x-auto gap-2 mb-3 scrollbar-thin scrollbar-thumb-amber-700 scrollbar-track-transparent">
              {post.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`photo-${idx}`}
                  className="w-full h-72 rounded-lg object-cover flex-shrink-0"
                />
              ))}
            </div>

            {/* Location and date information */}
            <p className="text-sm text-gray-600 mb-1">
              <strong>Location:</strong> {post.location}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Date:</strong> {post.date}
            </p>

            {/* Trip description */}
            <p className="text-gray-700 mb-4 text-sm">{post.description}</p>

            {/* Visit button with navigation */}
            <div className="w-full flex justify-center items-center mt-4">
              <button
                onClick={() => navigate(`/postDetails/${post.id}`)}
                className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-shadow shadow-md flex items-center gap-2"
              >
                Visit <ArrowRightCircle size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
