import express from "express"
import upload from "../config/multer.js";

// IMPORTING REQUIRED MIDDLEWARES
import isAuthenticated from "../middleware/auth.js";
import isValidDOB from "../middleware/agevalidate.js";
import postValidate from "../middleware/postvalidate.js";

// IMPORTING REQUIRED FUNCTIONS FOR VARIOUS OPERATIONS
import { user_signup, user_personality, user_signin } from "../controllers/userController.js";
import { post_add, post_get, post_visit, post_delete } from "../controllers/postController.js"
import { chat_user_insert, chat_user_get, chat_data_insert } from "../controllers/chatController.js";
import { remember_user_insert, remembered_user_get, remembered_user_chat } from "../controllers/rememberController.js"
const router = express.Router();

// isAuthenticated middleware is used for every request to verify the authenticity of the request

// SIGNUP
// WITH isValidDOB middleware to validate the age of the user
router.post("/signup", isValidDOB, isAuthenticated, user_signup)

// PERSONALITY 
router.post("/personality", isAuthenticated, user_personality)

// SIGN-IN
router.post("/signin", isAuthenticated, user_signin)

// ADD POST
// MULTER INCLUDED FOR LIMITED IMAGE UPLOADS
// with postValidate middleware to validate the post details
router.post("/add-post", isAuthenticated, upload.fields([{ name: 'images', maxCount: 3 }]) , postValidate, post_add )

// GET POSTS
router.get("/get-post", isAuthenticated, post_get);

// GET POST-DETAILS (VISITORS)
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

// SAVED PROFILES DIRECT CHAT
router.get("/remembered-user/chat/:id", isAuthenticated, remembered_user_chat)

// DELETE POST
router.get("/delete-post/:id", isAuthenticated, post_delete)


export default router;