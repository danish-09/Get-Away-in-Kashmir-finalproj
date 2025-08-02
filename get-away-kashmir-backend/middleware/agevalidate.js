
// CUSTOM MIDDLEWARE FOR AGE VALIDATION

function isValidDOB(req, res, next) {
    const dob = req.body.data.dob; // Extract DOB from the request body
    const birthDate = new Date(dob);
    const today = new Date();

    if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ error: "Backend says: Invalid date" });
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    if (age < 18) {
        return res.status(400).json({ error: "User must be at least 18 years old." });
    }

    // log
    console.log("age in middleware:",age);
    
    // continue to the next middleware or route handler
    next();
}

export default isValidDOB;