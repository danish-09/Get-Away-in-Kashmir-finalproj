import express from "express"
import upload from "../config/multer.js";

// importing the custom middlewares
import isAuthenticated from "../middleware/auth.js";
import isValidDOB from "../middleware/agevalidate.js";
import postValidate from "../middleware/postvalidate.js";

// import controller function
import { user_signup, user_personality, user_signin } from "../controllers/userController.js";
import { post_add, post_get, post_visit, post_delete } from "../controllers/postController.js"
import { chat_user_insert, chat_user_get, chat_data_insert } from "../controllers/chatController.js";
import { remember_user_insert, remembered_user_get, remembered_user_chat } from "../controllers/rememberController.js"

// creates router instance
const router = express.Router();

// isAuthenticated middleware is used for every request to verify the authenticity of the request

// signup
// with isValidDOB middleware to validate the age of the user
router.post("/signup", isValidDOB, isAuthenticated, user_signup)

// personality 
router.post("/personality", isAuthenticated, user_personality)

// signin
router.post("/signin", isAuthenticated, user_signin)

// add post
// multer for milited image uploads
// with postValidate middleware to validate the post details
router.post("/add-post", isAuthenticated, upload.fields([{ name: 'images', maxCount: 3 }]) , postValidate, post_add )

// get posts (for homepage)
router.get("/get-post", isAuthenticated, post_get);

// get post details (adds user to visitors and fetches other visitors)
router.get("/post-details/:id", isAuthenticated, post_visit)

// insert new chat user
router.get("/chat-user/:id", isAuthenticated, chat_user_insert)

// get chat user
router.get("/chat-user", isAuthenticated, chat_user_get)

// insert chat data
router.post("/chat-data/insert", isAuthenticated, chat_data_insert)

// insert saved profile
router.get("/remember-user/:id", isAuthenticated, remember_user_insert)

// get saved profile
router.get("/remembered-user", isAuthenticated, remembered_user_get)

// saved profile direct chat
router.get("/remembered-user/chat/:id", isAuthenticated, remembered_user_chat)

// delete post
router.get("/delete-post/:id", isAuthenticated, post_delete)


// will be imported in main server file
export default router;