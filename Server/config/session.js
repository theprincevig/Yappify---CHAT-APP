const session = require('express-session'); // Session management
const MongoStore = require('connect-mongo'); // MongoDB session store

// --------------------
// Session store (MongoDB) setup
// --------------------
const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL, // MongoDB connection URL
    crypto: {
        secret: process.env.SECRET // Secret key for encrypting sessions
    },
    touchAfter: 24 * 3600 // Session updated only once in 24 hours
});

// Handle store errors
store.on('error', (err) => 
    console.log(`ERROR in Mongo session store: ${err}`)
);

// --------------------
// Express-session configuration
// --------------------
const sessionOptions = {
    store, // MongoDB session store
    secret: process.env.SECRET, // Secret for session encryption
    resave: false, // Don’t resave unchanged sessions
    saveUninitialized: false, // Don’t save empty sessions
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expiry: 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000, // Max age: 1 week
        httpOnly: true, // Cookies not accessible via JS
        secure: process.env.NODE_ENV === "production", // Secure cookies in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" // SameSite policy
    }
};

module.exports = { session, sessionOptions };