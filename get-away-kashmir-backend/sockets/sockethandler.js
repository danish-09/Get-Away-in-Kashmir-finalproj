import db from "../config/db.js";

// function to generate unique chat_rooms
function create_chat_room(username1, username2)
{
    // sorts the usernanme and joins using underscore
    const chat_room = [username1,username2].sort().join("_");
    return chat_room;
}


async function handleSocketEvent (socket, io) {

    // initialise variables
    let chatroom = "";
    let s_name = "";
    let r_name = "";

    // log
    // console.log("user connected , id",socket.id);

    // listening for event
    socket.on('chat-room', async (room_req, callback) => {
        try{
        
        // log
        // console.log("chat record id from frontend", room_req);

        // query chat record using id of chat record (from frontend request)
        const result = await db.query(`SELECT sender_username, receiver_username from 
            chat_record where id=$1`, [room_req])

        const chat_record = result.rows[0];

        // username of sender and receiver from chat record
        s_name = chat_record.sender_username;
        r_name = chat_record.receiver_username;

        // invoke function to create chat room
        chatroom = create_chat_room(s_name, r_name);

        // log
        // console.log(`${s_name} has joined chatroom: ${chatroom}`);

        // user joins the chat romm
        socket.join(chatroom)

        // execute callback on success
        callback({
            status: "ok"
        })
    }

    catch(err)
    {
        // on error
        callback({status:"error"});
        console.error("error in chat room", err);
    }
})

    // on message event
    socket.on('chat-message', (message) => {

        // log
        // console.log("chat message ", message);

        // send message to the users in room
        io.to(chatroom).emit('received', message)

        // log
        // console.log(`message sent from ${s_name} to the ${r_name} is`, message);

    })

    // on socket disconnect
    socket.on('disconnect', () => {
        // log
        console.log(`user has disconnected , id `, socket.id)
    })

}



export default handleSocketEvent;

