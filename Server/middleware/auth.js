// --------------------
// MIDDLEWARE: Check if user is logged in
// --------------------
module.exports.isLoggedIn = (req, res, next) => {
    // If user is NOT authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) { 
        // Save the URL they tried to access in session
        req.session.redirectUrl = req.originalUrl; 
        
        // Respond with Unauthorized status
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // If authenticated, proceed to next middleware/route
    next();
}
