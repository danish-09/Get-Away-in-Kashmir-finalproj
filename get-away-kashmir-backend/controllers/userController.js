
import db from "../config/db.js";
import { getAuth, requireAuth, clerkClient} from '@clerk/express'

// user signup

export const user_signup = async (req, res)=>{
    try{
    
    // checks authorization header
    const token = req.headers.authorization?.split(" ")[1];

    // Check if token is present and valid
    // console.log("Received token:", token); 
    
    // current user id
    const current_User_Id = req.auth.userId;

    const {fullName, dob, gender} = req.body.data;

    // validation
    if (!fullName.trim() || !dob || !gender)
    {
        // error to user in case of missing fields
        return res.status(400).json({ error: "Backend says missing fields!" }); 
    }

    // db query to insert user details into users table
    const result = await db.query(
        `INSERT INTO users (user_id, fullname, dob, gender)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [current_User_Id, fullName, dob, gender]
      );
      
      const user = result.rows[0];
      
    // log
    // console.log("this is our user from our database:",user);

    // everything goes well
    return res.status(200).json({ message: "Authorized" });
    }
    catch(err)
    {
        // on error
        console.error("Server error during signup",err);
        // error for user
        return res.status(500).json({ error: "Error during signup, Please try again!" });
    }

}

// user personality 

export const user_personality = async (req, res)=>{
    try{
    
    // log
    // console.log("answers from personality",req.body);

    // answers to personality questionnaire (from frontend request)
    const rawAnswers = req.body.data;

    // transform the raw answers into th form expected by ML Api

    const answerArray = Object.keys(rawAnswers)
    .sort((a, b) => Number(a) - Number(b))       // Sort keys numerically
    .map((key) => Number(rawAnswers[key]));      // Convert each value to a number

    // log
    // console.log("answer array for sending to ML Api:", answerArray);

    // send answers to machine learning server
    const personality_result = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers: answerArray })
    });

    // response from ML server
    const personality_response = await personality_result.json();

    // predcited personality by ML server
    const predicted_personality = personality_response.personality;

    // find current user_id

    const current_User_Id = req.auth.userId;

    // check if personality record for current user already exists

    const check_personality_record = await db.query("select * from personality where user_id=$1", [current_User_Id]);
    
    // if personality record does not exist already
    if(check_personality_record.rowCount == 0)
    {
        const insert_personality = await db.query("insert into personality(personality, user_id) values ($1, $2) returning *", [predicted_personality, current_User_Id]);
        const db_personality_result = insert_personality.rows[0];

        // log
        // console.log("this is our stored personality", db_personality_result);

        // everything goes welll : sending predicted personality type to frontend to inform user
        return res.status(200).json({ message: "Submitted Successfully", personality_result:db_personality_result.personality});
    }


}
catch(err)
{
    // on error
    console.error("error occured while dealing with personality");
    // error for user
    return res.status(500).json({ error: "Server error occurred while dealing with personality" })
}

}

// user sign in

export const user_signin = async (req, res)=>{
    try{

    const userIdd = req.auth.userId;
    const user = await clerkClient.users.getUser(userIdd);
    
    // log
    // console.log("currenty logged in user:",user);
    
    // everything goes well
    return res.status(200).json({ message: "Login successfull!" });
    }
    catch(err)
    {
        // error
        console.error("Server error during login",err);
        // error for user
        return res.status(500).json({ error: "Error during login, Please try again!"});
    }
    
}






