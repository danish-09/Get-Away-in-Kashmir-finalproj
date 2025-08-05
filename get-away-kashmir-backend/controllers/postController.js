import db from "../config/db.js";
import { getAuth, requireAuth, clerkClient} from '@clerk/express'

// ADD POST/TRIP

export const post_add = async (req, res)=>{
    try{
    // log
    // console.log("route hit add -post wala");

    // fetching current user details
    const current_userId = req.auth.userId; 
    const user = await clerkClient.users.getUser(current_userId);
    const current_username = user.username; 

    // fetching the current user personality
    const result = await db.query(
        `SELECT personality FROM personality where user_id=$1`,
        [current_userId]
      );
    
    const user_personality = result.rows[0]?.personality || "";
    
    // log
    // console.log("personality yaar", user_personality);
    

    // check if user already exists in post_users : users who have made posts
    // if user exists he doesn't need to be added once again
    const result_post_user = await db.query(
        `SELECT * FROM post_users WHERE user_id=$1`,
        [current_userId]                         
      ); 

    // add user if user doesnt already exist in post_users
    if(result_post_user.rowCount === 0)
    {
        // db query to add user
        const result_insert_user = await db.query(
            `INSERT INTO post_users (username, personality, user_id)
            VALUES ($1, $2, $3) RETURNING *`,
            [current_username, user_personality, current_userId]                         
        );
        const post_user_response = result_insert_user.rows[0];

        // id of the post_user from db table
        var post_user_id = post_user_response.id;

        // log
        // console.log("post user response",post_user_response);
    }
    
    // if user already exists in post_user
    else
    {
        // fetch his post_user id from db table
       var post_user_id = result_post_user.rows[0].id;
    }


    // post details: 
    const postdata = req.body;

    //log
    // console.log("POST DATA IN BACKEND",postdata);

    // insert post details into post_details table in db
    // insert using the post_user id which we got above

    const result_post_details = await db.query(
        `INSERT INTO post_details (post_user_id, title, location, visit_date, description)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [post_user_id, postdata.title, postdata.location, postdata.visitDate, postdata.description]
      );

    const post_details_response = result_post_details.rows[0];
    
    // from post details
    // get id from post_details table that is the post id which is used in images table

    const current_post_id = post_details_response.id;

    // log
    // console.log("post THAT WAS ADDED : ",post_details_response);

    // images upload
    const user_images = req.files.images;

    // give error if more than 3 images uploaded
    if(user_images && user_images.length > 3)
    {
        // error for user
        return res.status(500).json({ error: "You can select a maximum of 3 images"});
    }

    if(user_images && user_images.length>0){

        // log
        // console.log("IMAGES ",user_images);

        for(let i=0;i<user_images.length;i++)
        {
            const img_path = user_images[i].path;

            // log
            // console.log("Path", img_path);

            // using above post id to store image path in table

            const result_insert_image = await db.query(
                `INSERT INTO post_images (post_id, image_url)
                VALUES ($1, $2)`,
                [current_post_id, img_path]
            );
        }
    }

    // insert user who made post to the visitors list by default (he is visiting since he made post) 
    // so other users can see his profile and more importantly chat with him 

    const result_insert_def_user = await db.query(
        `INSERT INTO post_visits (username, personality, post_id, user_id)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [current_username, user_personality, current_post_id, current_userId ]
    );

    // log
    // console.log("result OF INSERTING USER EARLIER",result_insert_def_user);
    

    // everything goes well
    return res.status(200).json({ message: "Post added successfully!" });
    }

    catch(err)
    {
        // on error
        console.error("Server error during add-post",err);
        // error for user
        return res.status(500).json({ error: "Error during add-post, Please try again!"});
    }
    
}

// GET THE POSTS/TRIPS

export const post_get = async (req, res)=>{
    try{

    // log
    // console.log("WE ARE IN GET POST ROUTE");

    // db query using join to get the trip data which we want to sent to the home page for rendering
    // the details are fetched from multiple tables
    const db_posts = await db.query(
        `select 
        post_details.id as post_id,
        post_details.title,
        post_details.location,
        TO_CHAR(post_details.visit_date,'DD-MM-YYYY') AS visit_date,
        post_details.description,
        post_users.username,
        post_users.personality,
        ARRAY_AGG(post_images.image_url) as images

        from post_details

        join post_users on post_details.post_user_id=post_users.id
        left join post_images on post_details.id=post_images.post_id

        GROUP BY post_details.id, post_users.id
        ORDER BY post_details.id DESC`
      );
    
    const result = db_posts.rows;
    
    // log
    // console.log("result from the database tables combined is", result);
    // console.log("no of rows",db_posts.rowCount);

    // everything goes well
    return res.status(200).json({ posts: result });
    }
    catch(err)
    {
        // on error
        console.error("Server error during fetch posts",err);
        // error sent to user
        return res.status(500).json({ error: "Error during fetch posts, Please try again!"});
    }

}


// GET DETAILS OF POST (VISITOR DETAILS FOR POST)

export const post_visit = async (req, res)=>{
    try{

    // for informing current user whether his profile was added to visitors list for a trip
    // or whether his profile was already added to the list 
    var check = false;

    // post id for which visitor list is required (from frontend request)
    const current_post_id = req.params.id;

    // current user id
    const current_User_Id = req.auth.userId;

    // current username
    const user = await clerkClient.users.getUser(current_User_Id);
    const current_username = user.username;

    // db query from personality
    const get_personality = await db.query(
        `SELECT personality from personality where user_id=$1`,
        [current_User_Id])

    const user_personality = get_personality.rows[0]?.personality || "";
    

    // checking if user is already added as visitor for the said post
    const check_visit_resp = await db.query(
        `SELECT * FROM post_visits where username=$1 and post_id=$2`,
        [current_username, current_post_id]);

    // if user is not already added as visitor for the specific post
    // then add user otherwise do nothing

    if(check_visit_resp.rowCount === 0)
    {
        // db query to add user to visitor list
        const result = await db.query(
        `INSERT INTO post_visits (username, personality, post_id, user_id)
        VALUES ($1, $2, $3, $4)`,
        [current_username, user_personality, current_post_id, current_User_Id]);
        
        // informs user that he has been inserted into visitors list
        var check = true;
    }

    
    // fetch from database visitors to the specific post
    // query doesnt allow the current user to see his own profile in visitor list
    // since he would not want to see himself and since its of no use to him


    // db query to get visitors but excludes the logged in user
    const visitors_response = await db.query(
        `SELECT id, username, personality FROM post_visits 
        where post_id=$1 AND username !=$2`,
        [current_post_id, current_username]);
    
    
    const visit_data = visitors_response.rows;

    // log
    // console.log("answer from post_visits", visitors_response.rows);

    // everything goes well
    // check helps in providing better reponse to user on the frontend
    return res.status(200).json({ data : visit_data, checked: check });

    }
    catch(err)
    {
        // on error
        console.error("Server error during get post visitors",err);
        // error for user
        return res.status(500).json({ error: "Error during get post visitors, Please try again!"});
    }

}


// DELETE POST
// delete option in frontend is only shown for posts made by logged-in user (still validate on backend)

export const post_delete = async (req, res)=>{
    try{
    
    // id of post which is to be deleted (comes from frontend request)
    const post_id = req.params.id;

    // current user id
    const current_User_Id = req.auth.userId;

    // db query to fetch post_user_id for post which is being requested to delete
    const verify_user = await db.query("select post_user_id from post_details where id=$1", [post_id]);
    const res_verify_user = verify_user.rows[0].post_user_id;

    // log
    // console.log("to be deleted post user id is", res_verify_user);

    // db query to fetch clerk user_id for the above fetched post_user_id
    const find_user = await db.query("select user_id from post_users where id=$1", [res_verify_user]);
    const res_find_user = find_user.rows[0].user_id;

    // log
    // console.log("clerk user id for user who posted the trip", res_find_user);

    // if current user id and user id for user who made the post match
    // then delete post
    if (res_find_user === current_User_Id)
    {
        // log
        // console.log("identity of user verified");
        
        // db query to delete post
        
        const del_res = await db.query("DELETE FROM post_details WHERE id = $1",[post_id]);

        // log
        // console.log(del_res.rowCount);

        if(del_res.rowCount === 1)
            {
                // deleted
                return res.status(200).json({message: "Post deleted successfully"})
            }
        else
            {
                // not deleted
                return res.status(400).json({error: "Post deletion unsuccessfull"})
            }
    }
    
}
catch(err)
{
    // on error
    console.error("error occured during delete post", err);
    // error for user
    return res.status(500).json({error:"Server error occured during post deletion"})
}

}
