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
          // to show questions
          setQAselection(true);
        }
      else if(personalityChoice==="later")
      {
        // user selected no to personality choice so go to home without showing questions
        navigate("/home");
      }
      },[personalityChoice]);

    
  // State for storing personality answers initialized as neutral
  const [answers, setAnswers] = useState({
    0:"0",
    1:"0",
    2:"0",
    3:"0",
    4:"0",
    5:"0",
    6:"0",
    7:"0",
    8:"0",
    9:"0",
    10:"0",
    11:"0",
    12:"0",
    13:"0",
    14:"0",
    15:"0",
    16:"0",
    17:"0",
    18:"0",
    19:"0",
    20:"0",
    21:"0",
    22:"0",
    23:"0",
    24:"0",
    25:"0",
    26:"0",
    27:"0",
    28:"0",
    29:"0",
    30:"0",
    31:"0",
    32:"0",
    33:"0",
    34:"0",
    35:"0",
    36:"0",
    37:"0",
    38:"0",
    39:"0",
    40:"0",
    41:"0",
    42:"0",
    43:"0",
    44:"0",
    45:"0",
    46:"0",
    47:"0",
    48:"0",
    49:"0",
    50:"0",
    51:"0",
    52:"0",
    53:"0",
    54:"0",
    55:"0",
    56:"0",
    57:"0",
    58:"0",
    59:"0",
  });

  // Navigation utility
  const navigate = useNavigate(); 


  // Array of personality assessment questions to be displayed
  const questions = [
    "You constantly make new friends",
    "You spend a lot of your free time exploring various random topics that pique your interest",
    "Seeing other people cry can easily make you feel like you want to cry too",
    "You often make a backup plan for a backup plan",
    "You usually stay calm, even under a lot of pressure",
    "At social events, you rarely try to introduce yourself to new people and mostly talk to the ones you already know",
    "You prefer to completely finish one project before starting another",
    "You are very sentimental",
    "You like to use organizing tools like schedules and lists",
    "Even a small mistake can cause you to doubt your overall abilities and knowledge",
    "You feel comfortable just walking up to someone you find interesting and striking up a conversation",
    "You are not too interested in discussing various interpretations and analyses of creative works",
    "You are more inclined to follow your head than your heart",
    "You usually prefer just doing what you feel like at any given moment instead of planning a particular daily routine",
    "You rarely worry about whether you make a good impression on people you meet",
    "You enjoy participating in group activities",
    "You like books and movies that make you come up with your own interpretation of the ending",
    "Your happiness comes more from helping others accomplish things than your own accomplishments",
    "You are interested in so many things that you find it difficult to choose what to try next",
    "You are prone to worrying that things will take a turn for the worse",
    "You avoid leadership roles in group settings",
    "You are definitely not an artistic type of person",
    "You think the world would be a better place if people relied more on rationality and less on their feelings",
    "You prefer to do your chores before allowing yourself to relax",
    "You enjoy watching people argue",
    "You tend to avoid drawing attention to yourself",
    "Your mood can change very quickly",
    "You lose patience with people who are not as efficient as you",
    "You often end up doing things at the last possible moment",
    "You have always been fascinated by the question of what, if anything, happens after death",
    "You usually prefer to be around others rather than on your own",
    "You become bored or lose interest when the discussion gets highly theoretical",
    "You find it easy to empathize with a person whose experiences are very different from yours",
    "You usually postpone finalizing decisions for as long as possible",
    "You rarely second-guess the choices that you have made",
    "After a long and exhausting week, a lively social event is just what you need",
    "You enjoy going to art museums.",
    "You often have a hard time understanding other peoples feelings",
    "You like to have a to-do list for each day",
    "You rarely feel insecure",
    "You avoid making phone calls",
    "You often spend a lot of time trying to understand views that are very different from your own",
    "In your social circle, you are often the one who contacts your friends and initiates activities",
    "If your plans are interrupted, your top priority is to get back on track as soon as possible",
    "You are still bothered by mistakes that you made a long time ago",
    "You rarely contemplate the reasons for human existence or the meaning of life",
    "Your emotions control you more than you control them",
    "You take great care not to make people look bad even when it is completely their fault",
    "Your personal work style is closer to spontaneous bursts of energy than organized and consistent efforts",
    "When someone thinks highly of you, you wonder how long it will take them to feel disappointed in you",
    "You would love a job that requires you to work alone most of the time",
    "You believe that pondering abstract philosophical questions is a waste of time",
    "You feel more drawn to places with busy, bustling atmospheres than quiet, intimate places.",
    "You know at first glance how someone is feeling.",
    "You often feel overwhelmed",
    "You complete things methodically without skipping over any steps.",
    "You are very intrigued by things labeled as controversial.",
    "You would pass along a good opportunity if you thought someone else needed it more",
    "You struggle with deadlines.",
    "You feel confident that things will work out for you",
  ];

  // Handler for updating answers when user interacts with range selector
  const handleAnswerChange = (index, value) => {

    // using prev which promises no stale data
    setAnswers(prev=>({ ...prev, [index]: value}));

  };
  
  // Form submission handler
  // Saves test results and navigates back
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submitting the personality form: :   ", answers);

    try {

      // API call to submit personality test answers
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

      // on error
      if(backend_result.error)
      {
        console.log("error from backend",backend_result.error);
        alert(`${backend_result.error}`);
        return;
      }

      // success: personality answers submitted and now resultant predicted personality is sent from backend
      else if(backend_result.message)
      {
        console.log("from backend",backend_result.message);
        console.log("from backend",backend_result.personality_result);
        
        // alerts user about his predicted personality type
        alert(`Success!, Your Personality Type is ${backend_result.personality_result}`)
        // navigate to home
        navigate("/home");
      }
      

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
  
    <div className="max-w-3xl mx-auto mt-5 p-6 bg-white rounded-xl shadow-lg h-full">
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


      {/* Test form */}
      {QAselection && (

      <form onSubmit={handleSubmit} className="space-y-6 overflow-y-scroll h-9/10">
        


        {/* Map through questions to create form fields */}
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            {/* Question text */}
            <p className="font-medium text-gray-800 my-6">
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
          className="w-full bg-[#d97706] text-white py-3 rounded-lg hover:bg-[#b45309] transition"
        >
          Submit
        </button>
      </form>

      )}
    </div>
  );
};

export default PersonalityTestPage;
