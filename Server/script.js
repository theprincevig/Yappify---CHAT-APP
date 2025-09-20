// Load environment variables from .env file when not in production
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// Port number where the server will run
const port = process.env.PORT;

// --------------------
// Imports
// --------------------
const express = require('express'); // Express framework
const User = require('./models/user.js'); // User model
const { app, server } = require('./config/socket.js'); // Express app & server with Socket.io
const { connectDB } = require('./config/db.js'); // MongoDB connection function
const session = require('express-session'); // Session management
const MongoStore = require('connect-mongo'); // MongoDB session store
const path = require('path'); // Path utilities
const cors = require('cors'); // Cross-Origin Resource Sharing
const ExpressError = require('./utils/expressError.js'); // Custom error handler

// Passport.js for authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Routers
const authRouter = require('./routes/user.js'); // Auth routes
const profileRouter = require('./routes/profile.js'); // Profile routes
const messageRouter = require('./routes/message.js'); // Chat message routes
const friendRouter = require('./routes/friend.js'); // Friend system routes

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
// CORS configuration
// --------------------
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Allowed frontend origin
    credentials: true // Allow cookies and credentials
};

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

// --------------------
// Middleware setup
// --------------------
app.set('trust proxy', 1);  // Trust proxy for HTTPS cookies in production
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse form submissions
app.use(cors(corsOptions)); // Enable CORS
app.use(session(sessionOptions)); // Use session middleware

// --------------------
// Passport.js setup
// --------------------
app.use(passport.initialize()); // Initialize passport
app.use(passport.session()); // Enable persistent login sessions

passport.use(new LocalStrategy(User.authenticate())); // Local strategy for login
passport.serializeUser(User.serializeUser()); // Store user in session
passport.deserializeUser(User.deserializeUser()); // Retrieve user from session

// --------------------
// Routes
// --------------------
app.use("/api/auth", authRouter); // Auth endpoints
app.use("/chat", messageRouter); // Messaging endpoints
app.use("/chat/profile", profileRouter); // Profile endpoints
app.use("/chat/friend", friendRouter); // Friend endpoints

// --------------------
// Serve static files in production
// --------------------
if (process.env.NODE_ENV === "production") {
    const clientBuildPath = path.join(__dirname, '../Client/dist');
    app.use(express.static(clientBuildPath)); // Serve frontend

    // Handle frontend routes
    app.get('/files{/*path}', (req, res) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}

// --------------------
// Handle 404 for /files/* routes
// --------------------
app.all("/files{/*path}", (req, res, next) => {
    next(new ExpressError(404, "Page not found!")); // Custom 404 error
});

// --------------------
// Global error handler
// --------------------
app.use((err, req, res, next) => {
    // console.error(err.stack); // Log error stack trace
    if (res.headersSent) {
        return next(err); // Let default handler work if headers already sent
    }
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Something went wrong."
    });
});

// --------------------
// Connect to DB and start server
// --------------------
connectDB()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((err) => 
        console.error(err)
    );
