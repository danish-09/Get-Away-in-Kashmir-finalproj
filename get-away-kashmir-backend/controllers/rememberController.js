
import db from "../config/db.js";
import { getAuth, requireAuth, clerkClient} from '@clerk/express'

function normalizeUserPair(userA, userB) {
    // alphabetical order sort
  const [user1, user2] = [userA, userB].sort(); 
  const normalized_pair = `${user1}:${user2}`;
  return { user1, user2, normalized_pair };
}

// INSERT AS REMEMBERED USER
export const remember_user_insert = async (req, res)=>{
    try{
    const id = req.params.id;
    console.log("id fro frrongted ", id);

    // get data from db
    const result1 = await db.query(`SELECT username, personality, user_id FROM post_visits
        where id=$1`, [id]);
    const db_res = result1.rows[0];

    const rem_username = db_res.username;
    const rem_personality = db_res.personality;
    const rem_userid = db_res.user_id;

    console.log(rem_username);
    console.log(rem_personality);
    console.log(rem_userid);

    

    const current_userId = req.auth.userId;
    console.log(current_userId);


    // validation

    const result = await db.query(`SELECT * FROM remembered_users
        where remembering_user_id=$1 and remembered_user_id=$2`, 
        [current_userId, rem_userid]);
    
    if(result.rowCount === 0)
    {
        // insert data into db only if no such record already exists
        const result2 = await db.query(`INSERT INTO remembered_users (remembering_user_id, remembered_user_id, remembered_username, remembered_personality)
        VALUES ($1, $2, $3, $4) RETURNING *`, [current_userId, rem_userid, rem_username, rem_personality]);
        const insert_res = result2.rows[0];
        
        console.log(insert_res);

        // sucess
        return res.status(200).json({message:"User added to your saved profiles"});
    }
}
catch(err)
{
    console.log(err);
    return res.status(500).json({error:"yes", message:"Server error while adding remembered user"})
}
}



// get the remembered users
export const remembered_user_get = async (req, res)=>{
    try{

    console.log("rpute hit remember user get!!");
    const current_userId = req.auth.userId;
    console.log(current_userId);
    
    const users = await db.query(`SELECT id, remembered_username, remembered_personality 
        FROM remembered_users where remembering_user_id=$1`, [current_userId]);
    
    const remembered_users = users.rows;
    
    // success
    return res.status(200).json({message: "successfully fetched remembered users", data: remembered_users});
    }

    catch(err)
    {
        console.log(err);
        return res.status(500).json({error:"yes", message:"Server error while fetching remembered users"})
    }

}



// INSERT CHAT USER FROM FRIENDS
export const remembered_user_chat = async (req, res)=>{
    try{
    console.log("aremeber chat user hit success");
    const saved_id = req.params.id;
    console.log("id from frontend come sas", saved_id);

    // db query from personality
    const result = await db.query(
        `SELECT remembered_username, remembered_personality from remembered_users where id=$1`,
        [saved_id]);
    
    const receiver_details = result.rows[0];
    const receiver_username = receiver_details.remembered_username;
    const receiver_personality = receiver_details.remembered_personality; 


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
    
    
    if(insert_result.rowCount !== 0)
    {
        console.log("inserted into db chat record",insert_result.rows[0]);
        const chat_record_id = insert_result.rows[0].id;
        console.log("chat record is",chat_record_id);
    }
    

    // everything goes well
    return res.status(200).json({ message: "Chat user created successfully!!" });
    
    }
    catch(err)
    {
        console.error("Error during adding chat user", err);
    }
}



