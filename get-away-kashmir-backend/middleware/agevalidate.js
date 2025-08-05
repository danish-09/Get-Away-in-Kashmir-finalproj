
// CUSTOM MIDDLEWARE FOR AGE VALIDATION

function isValidDOB(req, res, next) {

    // extract dob from the request body
    const dob = req.body.data.dob; 
    const birthDate = new Date(dob);
    const today = new Date();

    // getTime works only on valid date objects
    if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ error: "Backend says: Invalid date" });
    }

    // compute age logic
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    // under 18 users not allowed
    if (age < 18) {
        
        // error to user
        return res.status(400).json({ error: "User must be at least 18 years old." });
    }

    // log
    // console.log("age in middleware:",age);
    
    // continue to the next middleware or route handler
    next();
}

export default isValidDOB;