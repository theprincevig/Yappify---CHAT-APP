const passport = require('passport');

// --------------------
// Middleware: Authenticate using Passport local strategy
// --------------------
const authenticateLocal = (req, res, next) => {
    // Call Passport's local authentication strategy
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err); // Pass any errors to global error handler

        // Attach authenticated user and info to request object
        req.authUser = user;
        req.authInfo = info;

        // Continue to next middleware or controller
        next();
    })(req, res, next);
};

module.exports = authenticateLocal;
