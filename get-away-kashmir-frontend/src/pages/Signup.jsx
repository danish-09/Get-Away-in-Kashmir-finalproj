import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp, useSignIn, useAuth } from "@clerk/clerk-react"
import { useClerk } from "@clerk/clerk-react";
import { GoogleLogin } from '@react-oauth/google';
import FullPageSpinner from "../components/loader";

const Signup = () => {

  // clerk
  const { signUp, isLoaded, setActive } = useSignUp();

  // for checking signup data from clerk
  const { isLoaded: isAuthLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();

  // spinner
  const  [loading, setLoading] = useState(false);

  // const clerk  = useClerk();
  
  // const handleSuccess = async (credentialResponse) => {
  //   try {
  //     const googleToken = credentialResponse.credential; 
  //     console.log(googleToken);
  //   } catch (error) {
  //     console.error('Clerk sign-in error:', error);
  //   }
  // };
  
  //hook for navigation
  const navigate = useNavigate();


  // state for data it is an object with the required fields
  // setformdata is fxn to update the state , formdata reflects current state, usestate takes input thats initial values
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    dob: "",
    gender: "",
    password: "",
    
    // test: "",
  });

  // clerk: for code verification
  const [pendingverification, setpendingverification] = useState(false);
  const [code, setcode] = useState("");
  const [verificationError, setVerificationError] = useState("");



  // Inside your Signup component

  // When the component first mounts, check if the user has already taken the personality test (by checking local storage). 
  // If yes, update the form to reflect that the test is done already
  // useEffect(() => {
  //   console.log("personality taken badge: ",localStorage.getItem("personalityTaken"));
  //   const result_personality =
  //     localStorage.getItem("personalityTaken") === "true";
  //   if (result_personality) {
  //     setFormData((prev) => ({ ...prev, test: "yes" }));           // spread operator in js
  //   }
  // }, []);

  // useEffect(() => {
  //   console.log("form data updation for personality",formData)
  // }, [formData]);


 // state for errors
  const [errors, setErrors] = useState({});

  /*this function take a name and a value from the input field
  if you look at the input fields it has a property name which is same to name of key inside the 
    formdata state 

  */
  
  const handleChange = (e) => {
    // this function is more general so we do like this cuz this is dynamic otherwise well
    // have to hardcode this then this cant be used by multiple inputs in the form 
    const { name, value } = e.target;
    //when we use useState we can get the previous state of the object as well
    //here i take the previous state spread which means copying the old values
    //then [name] : value will change the specific value in the formdata object
    // this mean example i am typing the fullname the input field has a property fullname
    // so all the other fields will be copied as it is but the fullname will be replaced with value entered in the fullname input field
    
    // You might be using a stale version of formData, especially if multiple updates happen quickly.
    // React guarantees prev will be the most up-to-date version of the state, even in fast/queued updates.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // dob validation logic
  const isValidAge = (dobStr) => {
    const birthDate = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };
  



  const handleSubmit = async (e) => {
    e.preventDefault(); // avoids refresh page due to submit or other actions
    const newErrors = {};  // js object storing errors
    console.log("formdata is",formData);

    //basic regex for validation btw regex means regular expression so it is from the compiler design class
    const usernameRegex = /^[a-z0-9_]{5,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fullNameRegex = /^(?=.{3,20}$)[A-Za-z]+(?: [A-Za-z]+)*$/;
    //these are errors thrown when we submit the form

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (!fullNameRegex.test(formData.fullName)) newErrors.fullName = "Fullname must be 3–20 letters, only spaces allowed.";
    
    if (!usernameRegex.test(formData.username))
      newErrors.username =
        "Username must be 5–20 characters long, using only lowercase letters, numbers, or underscores";
    if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.dob ) {
      newErrors.dob = "Date of birth is required";
    }
    else if(!isValidAge(formData.dob)){
      newErrors.dob = "Invalid! User must be atleast 18 years old";
    }
    
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    // if (!formData.test)
    //   newErrors.test = "Must select one option";
    


    // sets the state for the errors now app can show errors next to form inputs
    setErrors(newErrors);
    
    // if there is no error then call the api
    // new errors is object so this fxn lists its keys i.e form field names so if there are no erros 
    // there wont be any keys aka form field names

    if (Object.keys(newErrors).length === 0 && isLoaded) {
      //API CALL HERE
      //wrapping the api call in try catch because it can through error
      // data from form

      const emailAddress = formData.email;
      const password = formData.password;
      const username = formData.username;
      

      try{

        // spinner
        setLoading(true);
  
        await signUp.create({
          emailAddress,
          password,
          username
        });

        // clerk: sends a one-time verification code 
        await signUp.prepareEmailAddressVerification({
          strategy:"email_code"
        });

        // spinner
        setLoading(false);
        alert("verification code sent to your email!");


        // set true since till now email is not completely verified
        setpendingverification(true) 

        // db calling
        // const result = await fetch("/api/signup", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${response.createdSessionId}`, // optional: secure communication
        //   },
        //   // for backend coverts to json(object notation) from js object
        //   body: JSON.stringify({ data: formData }),
        // });

        // const backend_result = await response.json();
   

        //set the local storage variables so that they are available around the whole app
        // if (result.success) {
          // accesses the browser's localStorage API.
          // localStorage.setitem,getitem,removeitem
          // XSS Attacks: localStorage is vulnerable if malicious scripts are injected.

//Never Store Sensitive Data: Avoid storing passwords or credit card info.

//Alternatives: For tokens, consider HttpOnly cookies (more secure against XSS).
// coming from backend data is stored in the localstore so we are obv storing only data that has 
// gone through all checks of frontend and backend 
// For subsequent requests, React sends the token to the backend.Backend validates the token to grant access.


        //   localStorage.setItem("token", backend_result.token);
        //   localStorage.setItem("username", backend_result.username);
        //   if (backend_result.personality) {
        //     localStorage.setItem("personality", backend_result.personality);
        //   }
        //   localStorage.setItem("isAuthenticated", true);
        //   navigate("/home");
        // } else {
        //   alert(backend_result.message || "Invalid credentials");
        // }
      } catch (error) {
        console.error("Signup error:", error);
        alert(`Signup failed. ${error.message}`);
        setLoading(false);
      }
    }
  };

  // contains final dealing with signup data
  const handleCodeSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh
    if (!isLoaded) return; // if clerk not setup then return

    try {
      // clerk
      // verify email address by validating the otp code provided by user against code sent during prepare verification step
      const result = await signUp.attemptEmailAddressVerification({ code });
      
      // local storage for personality test , this is json string
      // see what type of data to send to backend
      // console.log("personality ke answers:  :",localStorage.getItem("personalityAnswer"));
      
      // parse like convert to js object from json string , this js object again
      // see what type of data to send to backend

      // console.log("personality ke answers:  :",JSON.parse(localStorage.getItem("personalityAnswer")));
      
      if (result.status === "complete") {

        await setActive({ session: result.createdSessionId });
        const token = await getToken();
        console.log("signup token", token);

        // db calling
        console.log("SESSION TOKEN IN FRONTEND",token);
        const response = await fetch("http://localhost:3000/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // jwt session token
          },
          // for backend coverts to json(object notation) from js object
          body: JSON.stringify({ data: formData }),
        });

        // RESULT FROM BACKEND
        const backend_result = await response.json();
        console.log("result from BACKEND: ",backend_result);
        
        if(backend_result.error)
        {
          console.log("error from back",backend_result.error);
          alert(`${backend_result.error}`);
          return;
        }
        // goes to personality test
        navigate("/personality-test");
        



      } else {
        console.log("clerk status says missing fields!")
        setVerificationError("An error occurred during verification. Please try again");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationError("Verification failed. Please check the code and try again.");
    }
  };
  
  //this is just navigation to the personality test page

  // const handlePersonalitySelectChange = (e) => {
  //   const value = e.target.value;
  //   if (value === "yes") {
  //     navigate("/personality-test");
  //   }
  //   // always executes irrespective of navigation
  //   handleChange(e);
  // };

  //add logic for google signup
  // const handleGoogleSignup = async() => {
  //   try{

  //     clerk.openGoogleOneTap();
      
  //     // const res = await signIn.authenticateWithRedirect({
  //     //   strategy: "oauth_google",
  //     //   redirectUrl:"/home"
  //     // });
  //     // console.log("oauth status",res);
  //     // alert("Redirect to Google signup");
  //   }
  //   catch(err){
  //     console.log("error",err);
  //   }
    

  // };
  if(loading)
    {
      return <FullPageSpinner/>
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/signup-background.jpg')] bg-cover bg-center bg-no-repeat relative px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#D97706]">
          Create Your Account
        </h2>
         {/*  // no valdiate for overriding browser/html default behaviour */}
       
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* Personality Test */}
          {/* <div className="space-y-1">
            <label className="block font-medium text-gray-700">
              Take a personality test? (Recommended)
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="test"
                  value="yes"
                  onChange={handlePersonalitySelectChange}
                  checked={formData.test === "yes"}
                  required
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="test"
                  value="later"
                  onChange={handlePersonalitySelectChange}
                  required
                  checked={formData.test === "later"}
                />
                Maybe later
              </label>
            </div>
            {errors.test && (
              <p className="text-sm text-red-500">{errors.test}</p>
            )}
          </div> */}
          
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. John Doe"
              className={`w-full border ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D97706]`}
              onChange={handleChange}
              required
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="e.g. john_doe1"
              className={`w-full border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D97706]`}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. john@example.com"
              className={`w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D97706]`}
              onChange={handleChange}
              required
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              className={`w-full border ${
                errors.dob ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D97706]`}
              onChange={handleChange}
              required
            />
            {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              className={`w-full border ${
                errors.gender ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D97706]`}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="e.g. strongpassword123"
              className={`w-full border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D97706]`}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-[#D97706] text-white py-2 rounded-lg hover:bg-[#B45309] transition"
          >
            Register
          </button>
        </form>

        {/* Clerk verification of code */}
        {pendingverification && (
        <form onSubmit={handleCodeSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter code sent to your email:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setcode(e.target.value)}
                className={`w-full border ${verificationError ? "border-red-500" : "border-gray-300"} px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D97706]`}
                required
              />
              {verificationError && <p className="text-sm text-red-500">{verificationError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#D97706] text-white py-2 rounded-lg hover:bg-[#B45309] transition"
            >
              Verify Email
            </button>
          </form>
        )}

        {/* Google Sign Up */}
        
        {/* <div className="text-center text-gray-500">or</div>
        <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log('Google login Failed')}
        /> */}
        {/* <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign up with Google
          </button>
         */}
            

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-[#D97706] hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
