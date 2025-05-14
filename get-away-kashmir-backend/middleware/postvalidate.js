
// middleware for Add post details validation

function postValidate(req, res, next) {

    const data = req.body;

    const user_date = data["visitDate"];
    const selectedDate = new Date(user_date);
    const today = new Date();

    // Remove time part from both dates for an accurate comparison
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if(!data["title"].trim() || !data["location"].trim() || !data["description"].trim() || !data["visitDate"])
        {
            console.log("Missing details for add post");
            return res.status(500).json({ error: "Backend says, please provide all details!"});
        }
    else if( selectedDate < today)
    {
        console.log("Invalid date selection for add post");
        return res.status(500).json({ error: "Backend says, please input valid date!"});
    }
    next();

}

export default postValidate;