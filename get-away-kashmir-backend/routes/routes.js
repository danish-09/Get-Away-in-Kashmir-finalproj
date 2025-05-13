import express from "express"
import { clerkMiddleware, getAuth, requireAuth, clerkClient} from '@clerk/express'
import multer from "multer"
import db from "../config/db.js";

const router = express.Router();


// multer setup




const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'temp/uploads')
    },

    filename :function(req, file, cb){
        const unique_name = `${Date.now()}-${file.originalname}`;
         cb(null,file.fieldname+'-'+unique_name)

    }
})

const upload = multer({storage: storage})



function isValidDOB(req, res, next) {
    const dob = req.body.data.dob; // Extract DOB from the request body
    const birthDate = new Date(dob);
    const today = new Date();

    if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ error: "Backend says: Invalid date" });
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    if (age < 18) {
        return res.status(400).json({ error: "User must be at least 18 years old." });
    }

    // If valid, continue to the next middleware or route handler
    console.log("age in middleware:",age);
    next();
}

function postValidate(req, res, next) {
    const data = req.body;
    console.log(req.body);
    
    const user_date=data.visitDate;
    const selectedDate = new Date(user_date);
    const today = new Date();

    // Remove time part from both dates for an accurate comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if(!data.title.trim() || !data.location.trim() || !data.description.trim() || !data.visitDate)
        {
            console.log("Missing details for add post");
            return res.status(500).json({ error: "Backend says, please provide all details!"});
        }
    else if( selectedDate < today)
    {
        console.log("Invalid date selection for add post");
        return res.status(500).json({ error: "Backend says, please input valid date!"});
    }
    next();

}

async function isAuthenticated(req, res, next) {
    const auth = getAuth(req);
    // console.log(auth);

    if (!auth.userId) 
    {
        console.log("problem occured in authentication of request!")
        return res.status(400).json({ error: "Backend says not authorized for access" });
    }

    next();
}




// signup

router.post("/signup", isValidDOB, isAuthenticated, async (req, res)=>{
    try{
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received token:", token); // Check if token is present and valid
    
    const current_User_Id = req.auth.userId;

    const {fullName, dob, gender} = req.body.data;
    if (!fullName.trim() || !dob || !gender)
    {
        return res.status(400).json({ error: "Backend says missing fields!" }); 
    }
    const result = await db.query(
        `INSERT INTO users (user_id, fullname, dob, gender)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [current_User_Id, fullName, dob, gender]
      );
      
      const user = result.rows[0];
      console.log("this is our user from our database:",user);



    return res.status(200).json({ message: "Authorized" });
    }
    catch(err)
    {
        console.error("Server error during signup",err);
        return res.status(500).json({ error: "Error during signup, Please try again!" });
    }

})

// PERSONALITY 

router.post("/personality", isAuthenticated, async (req, res)=>{
    console.log("route hit personality wala");
    console.log("answers from personality",req.body);

    return res.status(200).json({ message: "personality form data submitted" });

    // PERSONALITY ROUTE WILL REMAIN UNTOUCHED UNTIL CLARITY ON PERSONALITY STUFF

    // RESULTING PERSONALITY BASED ON ANSWERS HAS TO BE STORED IN NEW TABLE 
    // WHERE JUST USER ID FROM CLERK AND HIS PERSONALITY WILL BE STORED 
    // FOREIGN KEY USER ID CASCADES
})

// SIGN-IN

router.post("/signin", isAuthenticated, async (req, res)=>{
    try{
    console.log("route hit LOGIN wala");
    const userIdd=req.auth.userId;
    const user = await clerkClient.users.getUser(userIdd);
    
    console.log("CURRENT USER:",user);
    return res.status(200).json({ message: "Login hogaya!" });
    }
    catch(err)
    {
        console.error("Server error during login",err);
        return res.status(500).json({ error: "Error during login, Please try again!"});
    }
    
})

// ADD POST

router.post("/add-post", isAuthenticated, upload.fields([{ name: 'images', maxCount: 3 }]) , async (req, res)=>{
    try{
    console.log("route hit add -post wala");
    const userIdd=req.auth.userId;
    const user_images = req.files.images;

    console.log("FILES: FROM FORM ",user_images);
    if(user_images.length>1){
        for(let i=0;i<user_images.length;i++)
        {
            const img_path = user_images[i].path;
            console.log("Path",img_path);
            // DATABASE INSERT INTO POSTS TABLE
            // db.query("INSERT INTO ////")
        }
    }

    // take from personality table 
    // const db_response = await db.query("SELECT personality FROM user_personality where user_id=$1",
    //     [userIdd]
    // );

    // const user_personality = db_response.rows[0];
    
    // use this to add to post data for rendering

    const user = await clerkClient.users.getUser(userIdd);
    const current_username = user.username;

    // use this username as well to add to post data for rendering
    
    const postdata = req.body;
    console.log("POST DATA IN BACKEND",postdata);

    

    // add to db  so that on home page we can render it 
    

    return res.status(200).json({ message: "Post added successfully!" });
    }
    catch(err)
    {
        console.error("Server error during add-post",err);
        return res.status(500).json({ error: "Error during add-post, Please try again!"});
    }
    
})


// GET POSTS

router.get("/get-post", isAuthenticated, async (req, res)=>{
    
});


export default router;