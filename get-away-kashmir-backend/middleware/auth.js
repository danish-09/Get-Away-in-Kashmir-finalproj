// middleware to deal with unauthenticated requests used to verify authorization of every incoming request
import { getAuth, requireAuth, clerkClient} from '@clerk/express'

async function isAuthenticated(req, res, next) {
    const auth = getAuth(req);

    if (!auth.userId) 
    {
        // log 
        console.log("problem occured in authentication of request!")
        
        // error to user
        return res.status(400).json({ error: "Backend says not authorized for access" });
    }

    // continue to the next middleware or route handler
    next();
}

export default isAuthenticated;