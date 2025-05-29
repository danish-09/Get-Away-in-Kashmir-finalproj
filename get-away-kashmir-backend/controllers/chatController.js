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
    // db query from personality
    const result = await db.query(
        `SELECT username, personality from post_visits where id=$1`,
        [visitor_id]);
    const receiver_details = result.rows[0];
    const receiver_username = receiver_details.username;
    const receiver_personality = receiver_details.personality; 


    const current_userId = req.auth.userId; 
    const user = await clerkClient.users.getUser(current_userId);
    const current_username = user.username; 
    const personality_res = await db.query(
        `SELECT personality from personality where user_id=$1`,
        [current_userId]);
    const current_personality = personality_res.rows[0] || "";

    const { user1, user2, normalized_pair } = normalizeUserPair(current_username, receiver_username);


    // insert to chat widnow of user

    // doesnt allow duplicates due to using normalized pair 
    // if other user aka reciver tries to tries to insert in the sense
    // user2 user1 in chat record normalize fucntion will reorder it
    // as defined in query on conflict nothing happens so the chat record
    // is not inserted since only 1 record will exist betweeen 2 users

    // insert into chat record
    // doesnt do anything if record between two already exists
    const insert_result = await db.query(`INSERT INTO chat_record (sender_username, sender_personality, receiver_username, receiver_personality, user1, user2)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (normalized_pair) DO NOTHING RETURNING *; `, [current_username, current_personality , receiver_username, receiver_personality, user1, user2]);
    
    console.log("inserted into db chat record",insert_result.rows[0]);
    const chat_record_id = insert_result.rows[0].id;
    console.log("chat record is",chat_record_id);


    
    // insert into chat messages , keep message empty but do insert
    // await db.query(`INSERT INTO chat_messages (chat_id,)
    //     VALUES ($1); `, [chat_record_id]);

    // everything goes well
    return res.status(200).json({ message: "Chat user created successfully!!" });
    }
    catch(err)
    {
        console.error("Error during adding chat user", err);
    }
}


// GET CHAT USER
export const chat_user_get = async (req, res)=>{

    try{
    const current_userId = req.auth.userId; 
    const user = await clerkClient.users.getUser(current_userId);
    const current_username = user.username;

    // check if chat users exist for the logged in user
    const chat_exists = await db.query(`SELECT * from chat_record WHERE sender_username = $1 OR receiver_username = $1`, [current_username]);
    
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
            ORDER BY cr.id, cm.id;`, [current_username])
        
        // console.log("the result for the chat window of user", result.rows);
        const rows = result.rows;

        // intialise userobject
        const userobject = {};

        for (const row of rows) {
            const {
                chat_id,
                chat_partner_username,
                chat_partner_personality,
                sender_username,
                content,
            } = row;

            
            // check if userobject exists
            if (!userobject[chat_id]) {
                userobject[chat_id] = {
                    id: chat_id,
                    name: chat_partner_username,
                    personality: chat_partner_personality,
                    messages: [],
                };
            }
        
            console.log("CHA0", userobject[chat_id]);
            
            // append messages to userobject only if some chat exists in record
            if(row.sender_username && row.content)
            {
                userobject[chat_id].messages.push({
                sender: sender_username,
                text: content,
            });
            }
        }
        
        // console.log(userobject);
        const finalChatList = Object.values(userobject); // this is what your frontend wants
        // console.log(finalChatList);

        // everything goes well
        return res.status(200).json({ message: "Chat users fetch successfull!", data: finalChatList });
    }
    else
    {
        return res.status(200).json({ message: "No existing chats found!" });
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
    console.log("ROUTE HIT CHAT DATA WALA")
    const response =  req.body;
    console.log(response);
    const chat_data = response.data;
    //for message object
    const sender_username = chat_data.sender;
    const sender_text = chat_data.text;
    // chat_id in chat_messages table comes from chat_record primary key i.e., id
    const chat_id = response.id;
    
   
    console.log("CHAT data from frontend", chat_data);
    console.log("CHAT id from chat_records coming from frontend", chat_id);
    // this is the just sent message directly
    // so lets insert it into the chat records
    // insert into chat messages table
    await db.query(`INSERT INTO chat_messages (chat_id, sender_username, content) values ($1, $2, $3)` , [chat_id, sender_username, sender_text]);


    // on succcess
    return res.status(200).json({message:"Successfully inserted message in chat_messages"});
    }
    catch(err)
    {
        console.error("error during inserting message",err);
        return res.status(500).json({message:"Backend says error during inserting message"});
    }
}
