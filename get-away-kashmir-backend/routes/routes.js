import express from "express"
import upload from "../config/multer.js";
import isAuthenticated from "../middleware/auth.js";
import isValidDOB from "../middleware/agevalidate.js";
import postValidate from "../middleware/postvalidate.js";

import { user_signup, user_personality, user_signin, post_add, post_get } from "../controllers/controller.js";

const router = express.Router();

// signup
router.post("/signup", isValidDOB, isAuthenticated, user_signup)

// PERSONALITY 
router.post("/personality", isAuthenticated, user_personality)

// SIGN-IN
router.post("/signin", isAuthenticated, user_signin)

// ADD POST
router.post("/add-post", isAuthenticated, upload.fields([{ name: 'images', maxCount: 3 }]) , postValidate, post_add )


// GET POSTS
router.get("/get-post", isAuthenticated, post_get);

// GET POST-DETAILS
router.get("/post-details/:id", isAuthenticated, async (req, res)=>{
    console.log("param is",req.params.id);
    
})


export default router;