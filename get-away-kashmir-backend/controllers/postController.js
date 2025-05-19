import db from "../config/db.js";
import { getAuth, requireAuth, clerkClient} from '@clerk/express'

// ADD POST


export const post_add = async (req, res)=>{
    try{
    console.log("route hit add -post wala");

    // fetching users details
    const current_userId = req.auth.userId; 
    const user = await clerkClient.users.getUser(current_userId);
    const current_username = user.username; 

    // fetching the cuurent users personality
    const result = await db.query(
        `SELECT personality FROM personality where user_id=$1`,
        [current_userId]
      );
    
    const user_personality = result.rows[0]?.personality || "";


    // check if user already exists among users who have made posts
    // if user exists he doesn't need to be added once again
    const result_post_user = await db.query(
        `SELECT * FROM post_users WHERE user_id=$1`,
        [current_userId]                         
      ); 

    // add user if user doesnt already exist in post_users
    if(result_post_user.rowCount===0)
    {
        const result_insert_user = await db.query(
            `INSERT INTO post_users (username, personality, user_id)
            VALUES ($1, $2, $3) RETURNING *`,
            [current_username, user_personality, current_userId]                         
        );
        const post_user_response = result_insert_user.rows[0];
        // id of the post_user this is different from user_id of clerk
        var post_user_id = post_user_response.id;
        console.log("post user response",post_user_response);
    }
    else
    {
       var post_user_id = result_post_user.rows[0].id;
    }


    // post details: 
    const postdata = req.body;
    console.log("POST DATA IN BACKEND",postdata);

    // insert post details into post data in db
    // insert using the post_user id which we got above
    const result_post_details = await db.query(
        `INSERT INTO post_details (post_user_id, title, location, visit_date, description)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [post_user_id, postdata.title, postdata.location, postdata.visitDate, postdata.description]
      );

    const post_details_response = result_post_details.rows[0];
    
    // from post details
    // get id from post_details that is the post id simply which is used in images table
    const current_post_id = post_details_response.id;
    console.log("post THAT WAS ADDED : ",post_details_response);

    // images
    const user_images = req.files.images;
    if(user_images.length > 3)
    {
        return res.status(500).json({ error: "You can select a maximum of 3 images"});
    }

    if(user_images && user_images.length>0){
        console.log("IMAGES ",user_images);
        for(let i=0;i<user_images.length;i++)
        {
            const img_path = user_images[i].path;
            console.log("Path", img_path);
            // using above post id to store image in table
            // storing the image path only 
            const result_insert_image = await db.query(
                `INSERT INTO post_images (post_id, image_url)
                VALUES ($1, $2)`,
                [current_post_id, img_path]
            );
        }
    }

    // insert user who made post to the visitors list of the post he made 
    // so other users can see and more importantly chat with him 

    const result_insert_def_user = await db.query(
        `INSERT INTO post_visits (username, personality, post_id, user_id)
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [current_username, user_personality, current_post_id, current_userId ]
    );

    console.log("result OF INSERTING USER EARLIER",result_insert_def_user);
    


    // everything goes well
    return res.status(200).json({ message: "Post added successfully!" });
    }

    catch(err)
    {
        console.error("Server error during add-post",err);
        return res.status(500).json({ error: "Error during add-post, Please try again!"});
    }
    
}


export const post_get = async (req, res)=>{
    try{
    console.log("WE ARE IN GET POST ROUTE");


    // db query using join to get the data which we want to sent to the home page for rendering
    // the posts , the details are fetched from multiple tables
    const db_posts = await db.query(
        `select 
        post_details.id as post_id,
        post_details.title,
        post_details.location,
        TO_CHAR(post_details.visit_date,'YYYY-MM-DD') AS visit_date,
        post_details.description,
        post_users.username,
        post_users.personality,
        ARRAY_AGG(post_images.image_url) as images

        from post_details

        join post_users on post_details.post_user_id=post_users.id
        left join post_images on post_details.id=post_images.post_id

        GROUP BY post_details.id, post_users.id
        ORDER BY post_details.visit_date ASC`
      );
    
    const result = db_posts.rows;
    console.log("result from the dattabase tables combined is", result);
    console.log("no of rows",db_posts.rowCount);

    // everything goes well
    return res.status(200).json({ posts: result });
    }
    catch(err)
    {
        console.error("Server error during fetch posts",err);
        return res.status(500).json({ error: "Error during fetch posts, Please try again!"});
    }

}


// GET DETAILS OF POST

export const post_visit = async (req, res)=>{
    try{

    // for telling user whether his profile was added to visitors list
    // or that his profile is already added to the list 
    var check = false;

    // post id from frontend request
    const current_post_id = req.params.id;

    // user id
    const current_User_Id = req.auth.userId;

    // username
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
        const result = await db.query(
        `INSERT INTO post_visits (username, personality, post_id, user_id)
        VALUES ($1, $2, $3, $4)`,
        [current_username, user_personality, current_post_id, current_User_Id]);
        var check=true;
    }

    
    
    // fetch from database visitors to the specific post
    // query doesnt allow the current user to see his profile
    // since we wont want to see himself and since its of no use to him

    const visitors_response = await db.query(
        `SELECT id, username, personality FROM post_visits 
        where post_id=$1 AND username !=$2`,
        [current_post_id, current_username]);
    
    const visit_data = visitors_response.rows
    console.log("answer from post_visits", visitors_response.rows);

    // everything goes well
    return res.status(200).json({ data : visit_data, checked: check });

    }
    catch(err)
    {
        console.error("Server error during get post visitors",err);
        return res.status(500).json({ error: "Error during get post visitors, Please try again!"});
    }

}

