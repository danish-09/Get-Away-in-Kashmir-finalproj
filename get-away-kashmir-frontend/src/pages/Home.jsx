// Import necessary React hooks and components
import React, { useState, useEffect } from "react";
import Avatar from "../components/Avatar";
import { useNavigate } from "react-router-dom";
import { ArrowRightCircle } from "lucide-react"; // Icon component for the visit button
import { useAuth } from "@clerk/clerk-react";

import { useUser } from "@clerk/clerk-react";
import { MdDelete } from "react-icons/md";
import { useRef } from "react";


// Home component to display all available trips
const Home = () => {

  const { user } = useUser();
  const current_username = user.username;

  const postContainerRef = useRef(null);

  const { isLoaded, getToken } = useAuth();

  // State to store all posts/trips 
  // its an array for a reason  
  const [posts, setPosts] = useState([]);

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // for ui position remember
  const handleOnClick = (post_id) => {
    const lastPosition = postContainerRef?.current.scrollTop;
    sessionStorage.setItem('postlastposition', lastPosition);
    navigate(`/postDetails/${post_id}`);

  }

  // Effect hook to fetch posts when component mounts 
  useEffect(() => {
    const fetchPosts = async () => {
      const token = await getToken();

      // Api Call to backend for fetching the posts/ trips
      const posts_response = await fetch('http://localhost:3000/api/get-post', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const resp = await posts_response.json()
      const data = resp.posts;
      
      // logging trips from backend
      console.log("backend se posts in home",resp.posts);

      // for ui
      const lastPosition = sessionStorage.getItem('postlastposition');
      if(postContainerRef?.current && lastPosition)
      {
        postContainerRef.current.scrollTop = parseInt(lastPosition, 10);

      }
      
      // setting state using trips from backend
      setPosts(data);
    };

    // Execute the fetch function
    fetchPosts();
  }, []);


  // handles deleting a trip , option only provided for trips posted by current logged in user

  const handleDelete = async (delete_id) => {
    const del_id = delete_id;
    console.log("delet id of post", del_id);

    const del_token = await getToken();
    // db calling
    const delete_post = await fetch(`http://localhost:3000/api/delete-post/${del_id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${del_token}` // jwt session token
        },          
      });

    const del_response = await delete_post.json();

    // on error
    if(del_response.error)
    {
      console.log("backend says error deleting post", del_response.error)
      alert(del_response.error)
    }
    // delete successfull
    else
    {
      console.log("backend says", del_response.message);
      alert(del_response.message);
      setPosts((prevPosts) => prevPosts.filter(post => post.post_id !== delete_id));
    }

  }

  // Render the component
  return (
    // Main container with full height and background
    <div className="bg-gray-200 px-4 py-6">
      {/* Page title */}
      <h1 className="text-3xl text-center font-bold text-amber-700 mb-8">
        Available Trips
      </h1>

      {/* Scrollable container for posts */}
      <div ref={postContainerRef} className="flex flex-col gap-6 items-center overflow-y-auto h-[80vh] px-2">
        {/* Map through posts and render each post card */}
        {posts.map((post) => (
          <div
            key={post.post_id}
            className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-200"
          >
            {/* User info section with avatar */}
            <div className="flex w-full justify-between items-center gap-4 mb-4">
              <div className="flex flex-row justify-center items-center">
              <Avatar username={post.username} personality={post.personality} />
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {post.username}
                </h3>
                <p className="text-sm text-gray-500">{post.personality}</p>
              </div>
              </div>
              
              <button 
            onClick={() => handleDelete(post.post_id)}
            className="text-red-600 hover:text-red-800 text-2xl font-medium"
            >
              {
                current_username === post.username && <MdDelete />
              }
              
            </button>
            </div>
            

            {/* Post title */}
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {post.title}
            </h2>

            {/* Horizontal scrollable photo gallery */}
            <div className="flex overflow-x-auto gap-2 mb-3 scrollbar-thin scrollbar-thumb-amber-700 scrollbar-track-transparent">
              {post.images.map((photo, idx) => photo ? (
                <img
                  key={idx}
                  src={`http://localhost:3000/uploads/${photo.split("\\").pop()}`}
                  alt={`photo-${idx}`}
                  className="w-full h-72 rounded-lg object-cover flex-shrink-0"
                />
              ) : null
              )}
            </div>

            {/* Location and date information */}
            <p className="text-sm text-gray-600 mb-1">
              <strong>Location:</strong> {post.location}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              <strong>Date:</strong> {post.visit_date.slice(0,10)}
            </p>

            {/* Trip description */}
            <p className="text-gray-700 mb-4 text-sm">{post.description}</p>

            {/* Visit button with navigation */}
            <div className="w-full flex justify-center items-center mt-4">
              <button
                onClick = {()=>handleOnClick(post.post_id)} 
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
