import db from "../config/db.js";
import { getAuth, requireAuth, clerkClient} from '@clerk/express'


function normalizeUserPair(userA, userB) {
    // alphabetical order sort
  const [user1, user2] = [userA, userB].sort(); 
  const normalized_pair = `${user1}:${user2}`;
  return { user1, user2, normalized_pair };
}


// INSERT CHAT USER
export const chat_user_insert = async (req, res)=>{
    try{
    const visitor_id = req.params.id;

    // db query for visitor details
    const result = await db.query(
        `SELECT username, personality from post_visits where id=$1`,
        [visitor_id]);
    const receiver_details = result.rows[0];
    const receiver_username = receiver_details.username;
    const receiver_personality = receiver_details.personality; 


    // current user details from clerk
    const current_userId = req.auth.userId; 
    const user = await clerkClient.users.getUser(current_userId);
    const current_username = user.username;
    
    // personality of current user
    const personality_res = await db.query(
        `SELECT personality from personality where user_id=$1`,
        [current_userId]);

    // log
    // console.log("personlaity res:::::", personality_res);

    const current_personality = personality_res.rows[0].personality || "";

    // log
    // console.log("right now user personality", current_personality);

    const { user1, user2, normalized_pair } = normalizeUserPair(current_username, receiver_username);

    // insert to chat widnow of user
    // doesn't allow duplicates due to using normalized pair 
    // if other user aka reciver tries to tries to insert in the sense
    // user2 user1 in chat record normalize function will reorder it
    // as defined in query on conflict nothing happens so the chat record
    // is not inserted since only 1 record will exist betweeen 2 users

    // insert into chat record
    // doesnt do anything if record between two already exists
    // db table computes normalized pair itself based on values of user1 and user2
    const insert_result = await db.query(`INSERT INTO chat_record (sender_username, sender_personality, receiver_username, receiver_personality, user1, user2)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (normalized_pair) DO NOTHING RETURNING *; `, [current_username, current_personality , receiver_username, receiver_personality, user1, user2]);
    
    if(!insert_result.rowCount===0)
    {
        // chat record add

        //log
        // console.log("inserted into db chat record",insert_result.rows[0]);

        const chat_record_id = insert_result.rows[0].id;
        // console.log("chat record is",chat_record_id);
    }
    

    // everything goes well
    return res.status(200).json({ message: "Chat user created successfully!!" });
    }
    catch(err)
    {
        //  on error
        console.error("Error during adding chat user", err);
    }
}


// GET CHAT USERS
export const chat_user_get = async (req, res)=>{

    try{
    
    // current user details
    const current_userId = req.auth.userId; 
    const user = await clerkClient.users.getUser(current_userId);
    const current_username = user.username;


    // check if chat users exist for the logged in user
    const chat_exists = await db.query(`SELECT * from chat_record WHERE sender_username = $1 OR receiver_username = $1`, [current_username]);
    
    // if some chat exists
    if(chat_exists.rowCount > 0)
    {
        const result = await db.query(`SELECT 
            cr.id AS chat_id,
            CASE
            WHEN cr.sender_username = $1 THEN cr.receiver_username
            ELSE cr.sender_username
            END AS chat_partner_username,
            CASE
            WHEN cr.sender_username = $1 THEN cr.receiver_personality
            ELSE cr.sender_personality
            END AS chat_partner_personality,
            cm.sender_username,
            cm.content
            FROM chat_record cr
            
            LEFT JOIN chat_messages cm ON cr.id = cm.chat_id
            WHERE cr.sender_username = $1 OR cr.receiver_username = $1
            ORDER BY cr.id DESC, cm.id;`, [current_username])
        
        // log
        // console.log("the result for the chat window of user", result.rows);

        const rows = result.rows;
        
        // log
        // console.log("this is from db after sort", rows);

        // intialise map object , maintains insertion order
        const usermap = new Map();

        for (const row of rows) {
            const {
                chat_id,
                chat_partner_username,
                chat_partner_personality,
                sender_username,
                content,
            } = row;

            
            // check if userobject exists
            if (!usermap.has(chat_id)) {
                usermap.set(chat_id, {
                    id: chat_id,
                    name: chat_partner_username,
                    personality: chat_partner_personality,
                    messages: [],
                })   
                };


            // append messages to userobject only if some chat exists in record
            if(row.sender_username && row.content)
            {   
                usermap.get(chat_id).messages.push({
                    sender: sender_username,
                    text: content,
                })
            }
        }

        const chatUserList = Array.from(usermap.values())

        // log
        // console.log("chatuser list:", chatUserList);

        // log
        // console.log("Chat users to be sent to backend", chatUserList);

        // everything goes well
        return res.status(200).json({ message: "Chat users fetch successfull!", data: chatUserList });
    }
    else
    {
        return res.status(200).json({ message: "No Chats exist"});
    }

    }
    catch(err)
    {
        console.error("Error during fetching chat users", err);
    }    
}


// INSERT CHAT DATA
export const chat_data_insert = async (req, res)=>{
    try{
    
    // log
    // console.log("ROUTE HIT CHAT DATA")

    const response =  req.body;
    const chat_data = response.data;

    // for message object
    const sender_username = chat_data.sender;
    const sender_text = chat_data.text;

    // chat_id in chat_messages table comes from chat_record primary key i.e., id
    const chat_id = response.id;
    
    // log
    // console.log("CHAT data from frontend", chat_data);
    // console.log("CHAT id from chat_records coming from frontend", chat_id);

    // insert chat message it into the chat records
    // insert into chat messages table
    await db.query(`INSERT INTO chat_messages (chat_id, sender_username, content) values ($1, $2, $3)` , [chat_id, sender_username, sender_text]);


    // on succcess
    return res.status(200).json({message:"Successfully inserted message in chat_messages"});
    }
    catch(err)
    {
        // on error
        console.error("error during inserting message",err);
        return res.status(500).json({message:"Backend says error during inserting message"});
    }
}
