import express from "express"
import upload from "../config/multer.js";
import isAuthenticated from "../middleware/auth.js";
import isValidDOB from "../middleware/agevalidate.js";
import postValidate from "../middleware/postvalidate.js";
import { user_signup, user_personality, user_signin } from "../controllers/userController.js";
import { post_add, post_get, post_visit } from "../controllers/postController.js"
import { chat_user_insert, chat_user_get, chat_data_insert } from "../controllers/chatController.js";
import { remember_user_insert, remembered_user_get, remembered_user_chat } from "../controllers/rememberController.js"
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
router.get("/post-details/:id", isAuthenticated, post_visit)

// INSERT NEW CHAT USER
router.get("/chat-user/:id", isAuthenticated, chat_user_insert)

// GET CHAT-USERS
router.get("/chat-user", isAuthenticated, chat_user_get)

// INSERT CHAT-DATA
router.post("/chat-data/insert", isAuthenticated, chat_data_insert)


// INSERT SAVED PROFILE
router.get("/remember-user/:id", isAuthenticated, remember_user_insert)


// GET SAVED PROFILES
router.get("/remembered-user", isAuthenticated, remembered_user_get)

// SAVED PROFILES DIRECT DHAT
router.get("/remembered-user/chat/:id", isAuthenticated, remembered_user_chat)


export default router;