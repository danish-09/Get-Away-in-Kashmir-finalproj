
// middleware for post details validation

function postValidate(req, res, next) {

    const data = req.body;

    const user_date = data["visitDate"];
    const selectedDate = new Date(user_date);
    const today = new Date();

    // Remove time part from both dates for an accurate comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // validate the details
    if(!data["title"].trim() || !data["location"].trim() || !data["description"].trim() || !data["visitDate"])
        {
            // on error
            console.log("Missing details for add post");
            // error for user
            return res.status(500).json({ error: "Backend says, please provide all details!"});
        }
    
    // if earlier date selected
    else if( selectedDate < today)
    {
        // on error
        console.log("Invalid date selection for add post");
        // error for user
        return res.status(500).json({ error: "Backend says, please input valid date!"});
    }

    // continue to the next middleware or route handler
    next();

}

export default postValidate;