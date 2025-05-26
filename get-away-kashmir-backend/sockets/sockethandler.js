import db from "../config/db.js";

// fucntion to generate sorted chat_rooms
function create_chat_room(username1, username2)
{
    const chat_room = [username1,username2].sort().join("_");
    return chat_room;
}


async function handleSocketEvent (socket, io) {

    // initialise variables
    let chatroom = "";
    let s_name = "";
    let r_name = "";


    console.log("user connected , id",socket.id);

    socket.on('chat-room', async (room_req, callback) => {
        try{
        console.log("chat record id from frontend", room_req);
        // id of chat record from frontend
        const result = await db.query(`SELECT sender_username, receiver_username from 
            chat_record where id=$1`, [room_req])
        const chat_record = result.rows[0];
        // username of sender and receiver from chat record
        s_name = chat_record.sender_username;
        r_name = chat_record.receiver_username;

        // invoke function to create chat room
        chatroom = create_chat_room(s_name, r_name);
        console.log(`${s_name} has joined chatroom: ${chatroom}`);

        // user joins the chat romm
        socket.join(chatroom)

        // execute callback on success
        callback({
            status: "ok"
        })
    }

    catch(err)
    {
        callback({status:"error"});
        console.error("error in chat room", err);
    }
})
    

    socket.on('chat-message', (message) => {
        console.log("chat message ", message);

        // send message to the users in room
        io.to(chatroom).emit('received', message)
        console.log(`message sent from ${s_name} to the ${r_name} is`, message);

    })

    // socket disconnect
    socket.on('disconnect', () => {
        console.log(`user has disconnected , id `, socket.id)
    })

}



export default handleSocketEvent;

