import express from "express"
import dotenv from "dotenv"
import { clerkMiddleware } from '@clerk/express'
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

// for socket
import { createServer } from 'node:http';
import { Server } from "socket.io" 

// imports the routes
import routes from "./routes/routes.js"

// imports socket handling function
import handleSocketEvent from "./sockets/sockethandler.js"

// path resolve
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env variables
dotenv.config()

// creates an Express application instance
const app = express();

// wraps the Express app inside a Node.js HTTP server.
// this server will forward all requests to the app
// HTTP server
const server = createServer(app);

// create a new WebSocket server (Socket.IO) and attach it to this existing HTTP server.
// You can share the same port for HTTP routes and real time WebSocket communication.

// socket.io needs access to the created server
// it will listen for socket requests and upgrade the connection
// socket io server instance

const io =  new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET","POST"]
    }
})

// cors to allow frontend domain to send requests

app.use(cors({
    origin:"http://localhost:5173"
}));

// clerk setup

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

// Serve images statically from temp/uploads
app.use('/uploads', express.static(path.join(__dirname, 'temp/uploads')));

// default
app.get("/", (req, res)=>{
    res.send("hello");

})

// socket io
// connection is a special event emitted by Socket.IO whenever a new client connects
// Each connected client gets a socket object.
// This socket:
// Represents the individual connection.
// Can emit or receive custom events.
// Has an ID (socket.id), useful to identify the client.

io.on('connection', (socket) => {

    // pass socket and io to function
    handleSocketEvent(socket, io);
})

// routing logic 

app.use("/api",routes);

// port define
const port = 3000;

// server listens
server.listen(port, () => {
    console.log(`Started listening on http://localhost:${port}`);
});


