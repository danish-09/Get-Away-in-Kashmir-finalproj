// Import necessary icons from Heroicons library
import {
  ChevronLeftIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/solid";
// Import React hooks for state management and side effects
import { useState, useEffect, useRef } from "react";
// Import custom Avatar component
import Avatar from "../components/Avatar";

// Chat component - Main chat interface component
const Chat = () => {
  // State for managing list of users/friends
  const [users, setUsers] = useState([]);
  // State for tracking currently selected user's ID
  const [selectedUserId, setSelectedUserId] = useState(null);
  // State for managing input field text
  const [input, setInput] = useState("");
  // State for storing chat messages with selected user
  const [messages, setMessages] = useState([]);
  // Ref to store WebSocket instance
  const socketRef = useRef(null);

  // Mock API function to simulate fetching friends list
  // Returns hardcoded user data with sample messages
  const fetchFriendsAPI = async () => {
    //API CALL HERE
    // const response = await fetch("/api/friends");
    // return await response.json();

    // Dummy return
    return [
      {
        id: 1,
        name: "Danish Najeeb",
        personality: "ISTJ",
        messages: [
          { sender: "other", text: "Hey! Are you going to Gulmarg too?" },
          { sender: "me", text: "Yes! Planning to leave next week." },
        ],
      },
      {
        id: 2,
        name: "Sheikh Mumin Ahmad",
        personality: "ISFP",
        messages: [
          { sender: "other", text: "Are we still on for Pahalgam trip?" },
          { sender: "me", text: "Absolutely, can’t wait!" },
        ],
      },
      {
        id: 3,
        name: "Mohammad Ayman",
        personality: "ISTP",
        messages: [
          {
            sender: "other",
            text: "Want to check out the Flower Festival?",
          },
          { sender: "me", text: "Yes, let’s make it happen." },
        ],
      },
    ];
  };

  // Mock API function to fetch chat history for a specific friend
  // Filters messages from dummy data based on friend ID
  const fetchChatsByFriendIdAPI = async (friendId) => {
    //API CALL HERE
    // const response = await fetch(`/api/chats/${friendId}`);
    // return await response.json();

    // Dummy logic to return messages
    const users = await fetchFriendsAPI();
    const user = users.find((u) => u.id === friendId);
    return user?.messages || [];
  };

  // Effect hook to fetch friends list when component mounts
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const dummyUsers = await fetchFriendsAPI();
        setUsers(dummyUsers);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, []);

  // Effect hook to establish WebSocket connection when a user is selected
  // Creates new WebSocket connection and sets up event handlers
  useEffect(() => {
    if (selectedUserId) {
      const ws = new WebSocket("ws://localhost:8080"); // Replace with your WebSocket server
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        // Optionally notify server of the selected chat
        ws.send(JSON.stringify({ type: "join", userId: selectedUserId }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      return () => {
        ws.close(); // Cleanup on unmount or user change
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  // Handler for incoming WebSocket messages
  // Updates messages and users state with new message data
  const handleWebSocketMessage = (message) => {
    if (message.type === "message") {
      setMessages((prev) => [...prev, message.data]);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId
            ? { ...user, messages: [...user.messages, message.data] }
            : user
        )
      );
    }
  };

  // Handler for sending new messages
  // Prevents empty messages, updates UI, and sends via WebSocket
  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessage = { sender: "me", text: input };

    try {
      // Immediately show user's message in UI
      setMessages((prev) => [...prev, newMessage]);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUserId
            ? { ...user, messages: [...user.messages, newMessage] }
            : user
        )
      );

      // Send message via actual WebSocket
      socketRef.current?.send(
        JSON.stringify({
          type: "message",
          text: input,
          to: selectedUserId,
        })
      );

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  // Handler for selecting a user to chat with
  // Updates selected user and fetches their chat history
  const handleSelectUser = async (id) => {
    setSelectedUserId(id);

    try {
      const messages = await fetchChatsByFriendIdAPI(id);
      setMessages(messages);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  // Handler for returning to friends list view
  // Resets selected user and clears messages
  const handleBackToFriends = () => {
    setSelectedUserId(null);
    setMessages([]);
  };

  // Find currently selected user object from users array
  const selectedUser = users.find((user) => user.id === selectedUserId);

  // Component UI rendering
  return (
    // Main container with responsive layout
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow-md rounded-xl flex flex-col lg:flex-row h-[80vh] overflow-hidden">
      {/* Friends list sidebar - visible only when no chat is selected */}
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
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg text-white max-w-xs ${
                    msg.sender === "me" ? "bg-amber-500" : "bg-gray-400"
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
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
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
