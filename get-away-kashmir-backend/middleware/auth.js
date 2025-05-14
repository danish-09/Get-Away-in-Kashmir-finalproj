// middleware to deal with unauthenticated requests
import { getAuth, requireAuth, clerkClient} from '@clerk/express'

async function isAuthenticated(req, res, next) {
    const auth = getAuth(req);
    // console.log(auth);

    if (!auth.userId) 
    {
        console.log("problem occured in authentication of request!")
        return res.status(400).json({ error: "Backend says not authorized for access" });
    }

    next();
}

export default isAuthenticated;