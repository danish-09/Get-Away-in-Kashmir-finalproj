import express from "express"
import dotenv from "dotenv"
import { clerkMiddleware } from '@clerk/express'
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
// socket
import { createServer } from 'node:http';
import { Server } from "socket.io" 

import routes from "./routes/routes.js"
import handleSocketEvent from "./sockets/sockethandler.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

// creates an Express application instance.
const app = express();
//socket
// wraps the Express app inside a Node.js HTTP server.
// this server will forward all requests to the app
// HTTP server
const server = createServer(app);

// socket.io server 
// server comes from websockets it knows how to accept websocket and fallback http connectionms
// Manage real-time client communication
//Emit and receive custom events

// “Create a new WebSocket server (Socket.IO) and attach it to this existing HTTP server.”
// This way:

// You can share the same port for HTTP routes and real-time WebSocket communication.

// Socket.IO listens for connection upgrades on the same server — no need to run two separate processes.

// cross origin resource sharing
// socket io server instance
const io =  new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
})

const port = 3000;

// CORS TO RUN TWO SERVERS

app.use(cors({
    origin:"http://localhost:5173"
}));

// CLERK SETUP

app.use(clerkMiddleware({
    jwtKey: process.env.CLERK_JWT_PUBLIC_KEY,
    authorizedParties: ["http://localhost:5173"],
    apiUrl:"http://localhost:5173"
}
))

// body parser comes prebundled with express
app.use(express.urlencoded({extended: true}));

// for dealing with json data 
app.use(express.json());

// Serve images statically from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'temp/uploads')));

// default
app.get("/", (req, res)=>{
    res.send("hello");
    console.log(process.env.CLERK_JWT_PUBLIC_KEY);
})

// socket io
// 'connection' is a special event emitted by Socket.IO whenever a new client connects (i.e. a frontend socket calls io.connect() or io()).
// Each connected client gets a socket object.
// This socket:
// Represents the individual connection.
// Can emit or receive custom events.
// Has an ID (socket.id), useful to identify the client.

io.on('connection', (socket) => {
    // pass scoket and io to function
    handleSocketEvent(socket, io);

    
    // socket.on('chat-message', (message)=>{
    //     console.log("message from user",message);
    //     socket.emit('received',message);
    // })


    // socket.on('chat_message', (mssg) => {
    //     console.log("received message",mssg);
    //     socket.broadcast.emit('received',mssg);
    // })

    // socket.on('disconnect', () => {
    //     console.log("user disconnected with id",socket.id);
    // })
})

// routing
app.use("/api",routes);



server.listen(port,()=>{
    console.log(`Started listening on http://localhost:${port}`);
})










// multipart form data is dealt by using multer
















// The clerkMiddleware() function checks the request's cookies and headers for a session JWT and,
//  if found, attaches the Auth object to the request object under the auth key. using req.auth



// {signInUrl: process.env.CLERK_SIGN_IN_URL}
// const user_Id=req.auth.userId;
// const current_User = await clerkClient.users.getUser(user_Id);
// console.log("current user:",current_User);

// SIGNUP

// app.post("/api/signup", isValidDOB, isAuthenticated, async (req, res)=>{
//     try{
//     const token = req.headers.authorization?.split(" ")[1];
//     console.log("Received token:", token); // Check if token is present and valid
    
//     const current_User_Id = req.auth.userId;

//     const {fullName, dob, gender} = req.body.data;
//     if (!fullName.trim() || !dob || !gender)
//     {
//         return res.status(400).json({ error: "Backend validation says missing fields!" }); 
//     }
//     const result = await db.query(
//         `INSERT INTO users (user_id, fullname, dob, gender)
//         VALUES ($1, $2, $3, $4) RETURNING *`,
//         [current_User_Id, fullName, dob, gender]
//       );
      
//       const user = result.rows[0];
//       console.log("this is our user from our database:",user);



//     return res.status(200).json({ message: "Authorized" });
//     }
//     catch(err)
//     {
//         console.error("Server error during signup",err);
//         return res.status(500).json({ error: "Error during signup, Please try again!" });
//     }

// })

// PERSONALITY 

// app.post("/api/personality", isAuthenticated, async (req, res)=>{
//     console.log("route hit personality wala");
//     console.log("answers from personality",req.body);

//     return res.status(200).json({ message: "personality form data submitted" });

//     // PERSONALITY ROUTE WILL REMAIN UNTOUCHED UNTIL CLARITY ON PERSONALITY STUFF

//     // RESULTING PERSONALITY BASED ON ANSWERS HAS TO BE STORED IN NEW TABLE 
//     // WHERE JUST USER ID FROM CLERK AND HIS PERSONALITY WILL BE STORED 
//     // FOREIGN KEY USER ID CASCADES
// })

// SIGN-IN

// app.post("/api/signin", isAuthenticated, async (req, res)=>{
//     try{
//     console.log("route hit LOGIN wala");
//     const userIdd=req.auth.userId;
//     const user = await clerkClient.users.getUser(userIdd);
    
//     console.log("CURRENT USER:",user);
//     return res.status(200).json({ message: "Login hogaya!" });
//     }
//     catch(err)
//     {
//         console.error("Server error during login",err);
//         return res.status(500).json({ error: "Error during login, Please try again!"});
//     }
    
// })

// ADD POST

// app.post("/api/add-post", isAuthenticated, upload.fields([{ name: 'images', maxCount: 3 }]) , async (req, res)=>{
//     try{
//     console.log("route hit add -post wala");
//     const userIdd=req.auth.userId;
//     const user_images = req.files.images;

//     console.log("FILES: FROM FORM ",user_images);
//     if(user_images.length>1){
//         for(let i=0;i<user_images.length;i++)
//         {
//             const img_path = user_images[i].path;
//             console.log("Path",img_path);
//             // DATABASE INSERT INTO POSTS TABLE
//             // db.query("INSERT INTO ////")
//         }
//     }

//     // take from personality table 
//     // const db_response = await db.query("SELECT personality FROM user_personality where user_id=$1",
//     //     [userIdd]
//     // );

//     // const user_personality = db_response.rows[0];
    
//     // use this to add to post data for rendering

//     const user = await clerkClient.users.getUser(userIdd);
//     const current_username = user.username;

//     // use this username as well to add to post data for rendering
    
//     const postdata = req.body;
//     console.log("POST DATA IN BACKEND",postdata);

    

//     // add to db  so that on home page we can render it 
    

//     return res.status(200).json({ message: "Post added successfully!" });
//     }
//     catch(err)
//     {
//         console.error("Server error during add-post",err);
//         return res.status(500).json({ error: "Error during add-post, Please try again!"});
//     }
    
// })

// GET POSTS

// app.get("/api/get-post", isAuthenticated, async (req, res)=>{
    
// });


