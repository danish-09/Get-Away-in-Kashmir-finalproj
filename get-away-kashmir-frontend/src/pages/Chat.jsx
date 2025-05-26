// Import necessary icons from Heroicons library
import { ChevronLeftIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
// Import React hooks for state management and side effects
import { useState, useEffect, useRef } from "react";
// Import custom Avatar component
import Avatar from "../components/Avatar";
import { useAuth } from "@clerk/clerk-react";

// for socket
import { io } from "socket.io-client"
import { useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";


// Chat component - Main chat interface component
const Chat = () => {

  // from clerk for logged in user's username
  const { user } = useUser();
  const current_username = user.username;

  // useref to store persistently socket connection and use it elsewhere
  const socketRef = useRef(null);
    

  // clerk
  const { isLoaded, getToken } = useAuth();

  // loading animation
  const [ loading, setLoading] = useState(true);


  // State for managing list of users/friends  // CORRECTION  SHOULD BE JUST CHAT USERS WHICH GET FROM BACKEND
  const [users, setUsers] = useState([]);  // SET
  // State for tracking currently selected user's ID
  const [selectedUserId, setSelectedUserId] = useState(null);  // SET ON CHAT USER SELECTION
  // State for managing input field text
  const [input, setInput] = useState("");
  // State for storing chat messages with selected user
  const [messages, setMessages] = useState([]); // THIS IS SET ON CHAT RETRIEVAL FROM DB
  //// Ref to store WebSocket instance
  // const socketRef = useRef(null);
  

  // from the post details page 
  const location = useLocation();
  const visitor_id = location.state?.visitorId;

  // coming from the home page after clicking on chat with a user
  // this useeffect will only run for this case 
  // useeffect for initial chat db use
  useEffect(() => {
    const initial_chat = async() => {
      if(visitor_id){
        try{
          //API CALL HERE
          //Simulated API call to insert selected visitor into chat users
          const token = await getToken();
          const response = await fetch(`http://localhost:3000/api/chat-user/${visitor_id}`, {
          method: 'GET',
          headers: {                    
            'Authorization': `Bearer ${token}`
          }
        });
        // const initial_chat_response = await response.json();
        // console.log("initial_chat_response",initial_chat_response.data);
      }
      catch(err)
      {
        console.error("error in chat db initial", err);
      }
  }}
  initial_chat();
}, [visitor_id]);

  
  console.log("VISITOR KA ID FROM DETAILS",visitor_id);

  // Mock API function to simulate fetching friends list                           3
  // Returns hardcoded user data with sample messages    


  // function to GET CHATS FROM BACKEnd database
  const fetchFriendsAPI = async () => { 

    // show loading
    setLoading(true);

    const token1 = await getToken();
    // get the chatusers from db
    const response = await fetch(`http://localhost:3000/api/chat-user`, {
          method: 'GET',
          headers: {                    
            'Authorization': `Bearer ${token1}`
          }
        });
    
    const db_users_response = await response.json();
    console.log("message from backend on fetching chat users",db_users_response.message);
    //loading animation stops
    setLoading(false)
    
    const chat_users = db_users_response.data;
    console.log("chat users ::::::", chat_users);
    return chat_users;
    
    
    
    

    // Dummy return
    // return [
    //   {
    //     id: 1,
    //     name: "Danish Najeeb",
    //     personality: "ISTJ",
    //     messages: [
    //       { sender: "other", text: "Hey! Are you going to Gulmarg too?" },
    //       { sender: "me", text: "Yes! Planning to leave next week." },
    //     ],
    //   },
    //   {
    //     id: 2,
    //     name: "Sheikh Mumin Ahmad",
    //     personality: "ISFP",
    //     messages: [
    //       { sender: "other", text: "Are we still on for Pahalgam trip?" },
    //       { sender: "me", text: "Absolutely, can’t wait!" },
    //     ],
    //   },
    //   {
    //     id: 3,
    //     name: "Mohammad Ayman",
    //     personality: "ISTP",
    //     messages: [
    //       {
    //         sender: "other",
    //         text: "Want to check out the Flower Festival?",
    //       },
    //       { sender: "me", text: "Yes, let’s make it happen." },
    //     ],
    //   },
    // ];
  };

  //  function to fetch chat history for a specific user

  const fetchChatsByFriendIdAPI = async (friendId) => {
    
    // API CALL HERE                                                    
    // const response = await fetch(`/api/chats/${friendId}`);
    // return await response.json();

    // Dummy logic to return messages
    // CHAT USERS FROM BACKEND
    // calls function to get chat_users
    const users = await fetchFriendsAPI();
    // finds selected user
    const user = users.find((u) => u.id === friendId);
    console.log("MESSAGES OF USER:::",user.messages);
    // returns with selected users messages
    return user?.messages || [];                      
  };

  // Effect hook to fetch friends list when component mounts
  // SET USERS 
  useEffect(() => { // FETCH CHAT  USERS FROM BACKEND
    const fetchFriends = async () => {
      try {
        // calls function
        const backend_Users = await fetchFriendsAPI();

        // set users onli if chat users exist 
        if(backend_Users){
          setUsers(backend_Users);
        }

      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  // Effect hook to establish WebSocket connection when a user is selected
  // Creates new WebSocket connection and sets up event handlers          // UER CLICK ON CHAT 
  useEffect(() => {

    // establish socket connection
    // avoids new connection if connection exists
    if(!socketRef.current)
    {
      socketRef.current = io("http://localhost:3000");
    }

    // if chat user clicked
    if(selectedUserId)
    {
      const joinroom = async () => {
        try{
          const room_response = await socketRef.current.timeout(500).emitWithAck('chat-room', selectedUserId)
          
          // executes only in case of error
          if(room_response.status !=="ok")
          {
            console.log("Error on joining room");
            alert("Error occured on joining room!");
          }
        }
        catch(err)
        {
          console.error("Error occured during socket connection!");
          alert("Error occured on joining room!");
        }
      }

      // call function
      joinroom();

      // on receiving a message from the chat room i.e from chat partner
      socketRef.current.on('received', (message) => {        
        console.log("received from backend", message);
        // this includes our own messages 
        setMessages((prev) => [...prev, message])

      })
    }
    
    // return 
    return () => {
      if(socketRef.current){
        socketRef.current.off("received");
      }
    }
  }, [selectedUserId])
    

    

    // function to run for connection to socket
  //   const websocketconnect = async() => {
  //     if (selectedUserId) {
  //       // socket connection made
  //     const socket = io("http://localhost:3000");
      
  //     // emit request with acknowledgement for joining chat room successfully
  //     try{
  //       const room_response = await socket.timeout(5000).emitWithAck('chat-room',selectedUserId);
        
        
  //       if(room_response.status !=="ok")
  //         {
  //           console.log("Error on joining room");
  //           alert("Error occured on joining room!");
  //         }
  //     }
  //     catch(err)
  //     {
  //       console.error("Error occured during socket connection!");
  //       alert("Error occured on joining room!");
  //     }
  //     }
  //   }

  //   // call function to establish socket connection
  //   websocketconnect()
  // },
  // [selectedUserId])

    

      
      // socket message
      // socket.on('connect', () => {
      //   socket.emit('start',msg)
      //   // socket.emit('chat_message', newMessage);
      // })
      // socket.on('received', (received_msg) => {
      //   console.log("from backend",received_msg);
      // })


      // SOCKET IO COMES INTO PLAY WHEN CHAT USER IS CLICKLED

      // SOCKET CONNECTION MADE HERE ON CLICKING CHAT USER

      // socket 
      // initilise socket connectio
      
      

      // SOCKET CODE 


      // const ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket server
      // socketRef.current = ws;

      // ws.onopen = () => {
      //   console.log("WebSocket connected");
      //   // Optionally notify server of the selected chat
      //   ws.send(JSON.stringify({ type: "join", userId: selectedUserId }));
      // };

      // ws.onmessage = (event) => {
      //   const message = JSON.parse(event.data);
      //   handleWebSocketMessage(message);
      // };

      // ws.onclose = () => {
      //   console.log("WebSocket disconnected");
      // };

      // ws.onerror = (err) => {
      //   console.error("WebSocket error:", err);
      // };

      // return () => {
      //   ws.close(); // Cleanup on unmount or user change
      // };
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  
  // Handler for incoming WebSocket messages
  // Updates messages and users state with new message data
  // const handleWebSocketMessage = (message) => {
  //   if (message.type === "message") {
  //     setMessages((prev) => [...prev, message.data]);
  //     setUsers((prevUsers) =>
  //       prevUsers.map((user) =>
  //         user.id === selectedUserId
  //           ? { ...user, messages: [...user.messages, message.data] }
  //           : user
  //       )
  //     );
  //   }
  // };

  // Handler for sending new messages
  // Prevents empty messages, updates UI, and sends via WebSocket
  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // object for new message
    
    const newMessage = { sender: `${current_username}`, text: input };
    console.log(newMessage);

    try {
      // Immediately show user's message in UI

      // dont set message by yourself in ui let web socket do it
      // setMessages((prev) => [...prev, newMessage]);


      // felt pointless
      // setUsers((prevUsers) =>
      //   prevUsers.map((user) =>
      //     user.id === selectedUserId
      //       ? { ...user, messages: [...user.messages, newMessage] }
      //       : user
      //   )
      // );

      // web socket connection made
      // const socket = io("http://localhost:3000");
      
      // emit request with acknowledgement for joining chat room
      // try{
      //   const room_response = await socket.timeout(5000).emitWithAck('chat-room',selectedUserId);
      //   if(room_response.status !=="ok")
      //     {
      //       console.log("Error on joining room");
      //       alert("Error occured on joining room!");
      //     }
      // }
      // catch(err)
      // {
      //   console.error("Error occured during socket connection!");
      //   alert("Error occured on joining room!");
      // }
      
      

      // after successfull joining of chatroom
      if(socketRef.current)
      {
        socketRef.current.emit('chat-message', newMessage);
      }
      
      // api call to backend to store the message just made
      // send message to backend and send id of the chat user
      const token2 = await getToken();
      const chat_insert = await fetch("http://localhost:3000/api/chat-data/insert", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token2}`
        },
        body: JSON.stringify({data: newMessage, id: selectedUserId})
      })
      // response after storing messsages
      const db_chat_insert = await chat_insert.json();
      console.log("response from db after inserting chats", db_chat_insert.message);

      console.log("MRER LIEYEEEE",messages);

      // resets the input field for new message
      setInput("");




      // const socket = io("http://localhost:3000");

      // // socket message
      // socket.on('connect', () => {
      //   socket.emit('chat_message', newMessage);
      // })
      // socket.on('received', (received_msg) => {
      //   console.log("from backend",received_msg);
      // })
      





      // Send message via actual WebSocket
      // socketRef.current?.send(
      //   JSON.stringify({
      //     type: "message",
      //     text: input,
      //     to: selectedUserId,
      //   })
      // );

      

      // call to db to store the new message in db
      //  sue this state selectedUserId // go to backend with this as params

      // 

    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handler for selecting a user to chat with
  // Updates selected user and fetches their chat history                1
  const handleSelectUser = async (id) => {
    // ON CLICK USER CHAT USERID IS SET
    // this also opens up chat window with the chat user
    setSelectedUserId(id);   

    try {
      const messages = await fetchChatsByFriendIdAPI(id);
      // SETTING STATE for MESSAGES they are already existing they come from the db
      setMessages(messages); 
      console.log("MESSAGES that are set and canme from db",messages);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  // Handler for returning to friends list view
  // Resets selected user and clears messages  // CORRECTION HANDLE BACK TO CHATS
  const handleBackToFriends = () => {
    // USER ID NULL when chat windows with user is closed
    setSelectedUserId(null); 
    // MESSAGE STATE RESET 
    setMessages([]); 
  };

  // Find currently selected user object from users array exp runs on every render
  const selectedUser = users?.find((user) => user.id === selectedUserId);

  
  // loading animation 
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }
  
  // Component UI rendering
  return (
    // Main container with responsive layout
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-md rounded-xl flex flex-col lg:flex-row h-[80vh] overflow-hidden">
      {/* Friends list sidebar - visible only when no chat is selected */}
      {/* WHOLE DIV WILL BE HIDDEN IF CHAT WITH USER SELECTED*/}
      {/* CORRECTION : ITS NOT FRIENLDIST BUT THE EXISTING CHATS OF USER GOT FROM THE DB*/}
      <div className={`w-full bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-white p-4 space-y-4 overflow-y-auto ${
        selectedUserId ? "hidden" : "block"
      }`}
      >
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-amber-800"
            onClick={() => handleSelectUser(user.id)}
          >
            <Avatar username={user.name} personality={user.personality} />
            <span>
              {user.name}
              <p className="text-sm">{user.personality}</p>
            </span>
          </div>
        ))}
      </div>

      {/* Chat window - visible only when a user is selected */}
      {selectedUserId && (
        <div className="flex-1 flex flex-col p-6">
          {/* Chat header with back button and user name */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackToFriends}
              className="p-2 rounded-full bg-amber-500 hover:bg-amber-600 transition"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 flex-1">
              Chat with {selectedUser.name}
            </h2>
            <ChatBubbleOvalLeftIcon className="h-6 w-6 text-gray-600" />
          </div>

          {/* Messages container with scroll */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-2">
            {messages.map((msg, idx) => (
              // to every message both divs apply their own styling
              <div
                key={idx}
                className={`flex ${
                  msg.sender === `${current_username}` ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg text-white max-w-xs ${
                    msg.sender === `${current_username}` ? "bg-amber-500" : "bg-gray-400"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Message input form */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
