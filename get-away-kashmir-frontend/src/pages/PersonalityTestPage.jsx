// Import necessary dependencies for form handling and navigation
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import RangeSelector from "../components/RangeSelector";
import { useAuth } from "@clerk/clerk-react"

// PersonalityTestPage component - Handles personality assessment questionnaire
const PersonalityTestPage = () => {

  // state for showing q/a of personality intially set as false
  const [QAselection, setQAselection] = useState(false);


  const { isLoaded: isAuthLoaded, getToken } = useAuth()

  // Stores yes / no to personality test
  const [personalityChoice, setpersonalityChoice] = useState("");

  // personality choice 
  useEffect(() => {
      console.log("personality test",personalityChoice);
      if(personalityChoice==="yes")
        {
          setQAselection(true);
        }
      else if(personalityChoice==="later")
      {
        // user selected no to personality choice so go to home
        navigate("/home");
      }
      },[personalityChoice]);

    
  // State for storing personality answers initialized as neutral
  const [answers, setAnswers] = useState({
    0:"2",
    1:"2",
    2:"2",
    3:"2",
    4:"2",
    5:"2",
    6:"2",
    7:"2",
    8:"2",
    9:"2",
  });

  // Navigation utility
  const navigate = useNavigate(); 

  // Array of personality assessment questions
  const questions = [
    "Questions goes here.",
    "Questions goes here.",
    "Questions goes here.",
    "Questions goes here..",
    "Questions goes here.",
    "Questions goes here.",
    "Questions goes here..",
    "Questions goes here..",
    "Questions goes here.",
    "Questions goes here.",
  ];

  // Handler for updating answers when user interacts with range selector
  const handleAnswerChange = (index, value) => {
    // using prev which promises no stale data
    setAnswers(prev=>({ ...prev, [index]: value}));
    // setAnswers({ ...answers, [index]: value });
  };
  
  // Form submission handler
  // Saves test results and navigates back
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submitting the personality form: :   ", answers);

    try {
      // API integration placeholder
      // Simulate API call to submit personality testa
      const token = await getToken();
      console.log("token in personality",token);
      const response = await fetch('http://localhost:3000/api/personality', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: answers })
      });
      const backend_result = await response.json();
      console.log("from personality backend:",backend_result);
      if(backend_result.error)
      {
        console.log("error from backend",backend_result.error);
        alert(`${backend_result.error}`);
        return;
      }
      navigate("/home");
      // response from backend


      // Save results to localStorage
      // Mark test as completed in local storage
      // stringify cuz local storage handles strings only 
      // localStorage.setItem("personalityAnswer",JSON.stringify(answers));
      // console.log("personality answers:  ",localStorage.getItem("personalityAnswer"));
      
      // localStorage.setItem("personalityTaken", true);

      // goes to home

    } catch (error) {
      console.error("Error submitting personality test:", error);
      alert("Failed to submit test. Please try again.");
    }
  };

  // UI Structure:
  // - Centered container with white background
  // - Title section
  // - Form with questions and range selectors
  // - Submit button
  return (
  
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      {/* Page title */}
      <h1 className="text-3xl font-bold text-center text-[#78350f] mb-6">
        Personality Test
      </h1>
      {!QAselection && (
        <div className="mt-10 flex flex-col items-center">
          <label className="text-2xl font-semibold text-gray-700 mb-8">
            Take a personality test? (Recommended)
          </label>
          <div className="flex gap-8">
            <label className="flex items-center gap-2 text-lg">
              <input
              type="radio"
              name="test"
              value="yes"
              className="accent-amber-700"
              onChange={(e) => setpersonalityChoice(e.target.value)}
              required
              />
              Take personality test now
            </label>
            <label className="flex items-center gap-2 text-lg">
              <input
              type="radio"
              name="test"
              value="later"
              className="accent-amber-700"
              onChange={(e) => setpersonalityChoice(e.target.value)}
              required
              />
              Proceed without personality test
            </label>
          </div>
      </div>
    )}

    {/* not needed */}
      {/* <div className="space-y-1 flex items-center justify-center">
            <label className="text-2xl block font-semibold text-gray-700">
              Take a personality test? (Recommended)
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="test"
                  value="yes"
                  // onChange={handlePersonalitySelectChange}
                  // checked={formData.test === "yes"}
                  required
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="test"
                  value="later"
                  // onChange={handlePersonalitySelectChange}
                  required
                  // checked={formData.test === "later"}
                />
                Maybe later
              </label>
            </div>
      </div> */}

      {/* Test form */}
      {QAselection && (

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Map through questions to create form fields */}
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            {/* Question text */}
            <p className="font-medium text-gray-800">
              {index + 1}. {question}
            </p>
            {/* Range selector component */}
            <div className="flex flex-row gap-4">
              <RangeSelector index={index} handleChange={handleAnswerChange} />
            </div>
          </div>
        ))}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-[#d97706] text-white py-3 mt-4 rounded-lg hover:bg-[#b45309] transition"
        >
          Submit
        </button>
      </form>

      )}
    </div>
  );
};

export default PersonalityTestPage;
