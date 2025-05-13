// Import necessary React hooks and routing utilities
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react"

// AddPost component - Handles creation of new trip posts with images and details
const AddPost = () => {
  // Authentication token retrieval is commented out for now
  // const token = localStorage.getItem("token");

  // useAuth for jwt token
  const { isLoaded, getToken  } = useAuth();

  // state for errors
  const [errors, setErrors] = useState({});
    
  // State management for form data
  const [title, setTitle] = useState(""); // For trip title
  const [imgfile, setImgFile] = useState([]); // For image upload for backend
  const [images, setImages] = useState([]); // Array to store image preview URLs
  const [location, setLocation] = useState(""); // For trip location
  const [visitDate, setVisitDate] = useState(""); // For when the trip occurred
  const [description, setDescription] = useState(""); // For detailed trip description
  
  const navigate = useNavigate(); // Hook for programmatic navigation

  // vali date validation logic
  const isvalidDate = (inputDate) => {
    const selectedDate = new Date(inputDate);
    const today = new Date();
  
    // Remove time part from both dates for an accurate comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
  
    // true if selected date bu user is today or afterwards
    // false if earlier date is selected
    return selectedDate >= today;
  };

  
  // Handles image file selection and preview generation
  // Creates object URLs for selected images to show previews
  const handleImageChange = (e) => {
    // Array.from turns an array from any object with a length property.
    // new array instance

    const files = Array.from(e.target.files); // Convert FileList to array
    setImgFile(files);
    
    // string containing a URL representing the file.
    const previews = files.map((file) => URL.createObjectURL(file)); // Create preview URLs
    // so in images we have the urls of these things
    setImages(previews);

  };

  // Form submission handler
  // Creates a new post object and would typically send it to an API
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const newErrors = {};  // js object storing errors
    
    // images can be not selected //
    // WHAT IF GORE IMAGES SEE ON THAT?

    // validation

    if(!title.trim()) newErrors.title = "Title is required";
    if(!location.trim()) newErrors.location = "Location is required";
    if(!visitDate) newErrors.visitDate = "Visit date is required";
    else if(!isvalidDate(visitDate)) {
      newErrors.visitDate = "Select a valid date"
    }
    if(!description.trim()) newErrors.description = "Description is required";

    // set the errors
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && isLoaded) {

      // const newPost = {
      //   title,
      //   imgfile,
      //   location,
      //   description,
      //   visitDate,
      //   // Add timestamp 
      //   createdAt: new Date().toISOString(), // utc coordinated universal time
        
      // };      
      // console.log("Post added:", newPost);

      // formdata obj
      const formData = new FormData();

      formData.append("title", title);
      formData.append("location", location);
      formData.append("visitDate", visitDate);
      formData.append("description", description);
      formData.append("createdAt", new Date().toISOString());

      imgfile.forEach((file) => {
        formData.append("images", file);
      });

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      try{
        const token = await getToken();
        const response = await fetch("http://localhost:3000/api/add-post", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}` // jwt session token
          },
          body: formData,
        });

        const result = await response.json();
        if (!result.error) 
        {
          console.log("Backend says post added sucessfully");
          alert("Post added successfully")
          navigate("/home");
          return;
        }
        else
        {
          alert(`${result.error}`);
          console.log("error from backend add post :",result.error);
        }
        
      //     setTitle("");
      //     setImages([]);
      //     setLocation("");
      //     setDescription("");
      //     setVisitDate("");
      //    navigate("/home");
      //   } 
      //   else {
      //   alert(result.message || "Invalid credentials");

      }
      catch(error)
      {
        console.error("Error adding post:", error);
      }
    }

    // Create new post object with form data
    

    //API CALL HERE

    // API call commented out - would send post data to backend
    // try {
    //   const response = await fetch("/api/add-post", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //           "token":token,
    //     },
    //     body: JSON.stringify({ post: newPost }),
    //   });

    //   const result = await response.json();

    //   if (result.success) {
    //     setTitle("");
    //     setImages([]);
    //     setLocation("");
    //     setDescription("");
    //     setVisitDate("");
    //     alert("Post added successfully!");
    //     navigate("/home");
    //   } else {
    //     alert(result.message || "Invalid credentials");
    //   }
    // } catch (err) {
    //   console.error("Login error:", err);
    //   alert("Something went wrong. Please try again.");
    // }

    // Reset form fields after submission
    // setTitle("");
    // setImages([]);
    // setLocation("");
    // setDescription("");
    // setVisitDate("");
    // alert("Post added successfully!");
    // navigate("/home"); // Redirect to home page
  };

  // UI Structure:
  // - Main container with centered content and shadow
  // - Form with multiple input sections:
  //   1. Title input
  //   2. Image upload with preview
  //   3. Location input
  //   4. Visit date picker
  //   5. Description textarea
  //   6. Submit button
  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md">
      {/* Form title with styling */}
      <h1 className="text-2xl font-bold mb-6 text-amber-700">
        Create a New Trip
      </h1>

      {/* Form with Tailwind styling for consistent spacing */}
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data" noValidate>
        {/* Title input with label and styling */}
        <div>
          <label className="block text-amber-700 mb-2">Title</label>
          <input
            type="text"
            className={`w-full border ${
                errors.title ? "border-red-500" : "border-amber-300"
              } border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Trip to Sonamarg"
            required
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Image upload section with preview grid */}
        <div>
          <label className="block text-amber-700 mb-2">Upload Images (optional)</label>
          <input
            type="file"
            name="files"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full border border-amber-300 rounded-lg px-4 py-2 text-gray-700 file:bg-amber-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md file:cursor-pointer"
          />
          {/* Image preview grid */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`preview-${index}`}
                  className="rounded-lg h-24 w-full object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Location input field with validation */}
        <div>
          <label className="block text-amber-700 mb-2">Location</label>
          <input
            type="text"
            className={`w-full border ${
                errors.location ? "border-red-500" : "border-amber-300"
              } border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Specific location, district"
            required
          />
          {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
        </div>

        {/* Date picker for visit date */}
        <div>
          <label className="block text-amber-700 mb-2">Visit Date</label>
          <input
            type="date"
            className={`w-full border ${
                errors.visitDate ? "border-red-500" : "border-amber-300"
              }  border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            required
          />
          {errors.visitDate && <p className="text-sm text-red-500">{errors.visitDate}</p>}
        </div>

        {/* Multi-line description textarea */}
        <div>
          <label className="block text-amber-700 mb-2">Description</label>
          <textarea
            className={`w-full border ${
                errors.description ? "border-red-500" : "border-amber-300"
              } border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500`}
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your trip details"
            required
          ></textarea>
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Submit button with hover effects */}
        <button
          type="submit"
          className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default AddPost;
