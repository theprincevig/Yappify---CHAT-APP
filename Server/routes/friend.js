const express = require("express");               // Import Express
const router = express.Router();                  // Create a new router instance
const { isLoggedIn } = require("../middleware/auth.js");  // Auth middleware to check if user is logged in
const friendController = require("../controller/friend.js"); // Controller for friend-related actions
const wrapAsync = require("../middleware/wrapAsync.js");   // Helper to catch async errors

// --------------------
// Friend Routes
// --------------------

// Send a friend request to user with given ID
router.post("/request/:id",
    isLoggedIn,                                 // Ensure user is authenticated
    wrapAsync(friendController.sendRequest)     // Controller handles sending request
);

// Cancel a sent friend request to user with given ID
router.post("/cancel/:id",
    isLoggedIn,
    wrapAsync(friendController.cancelRequest)
);

// Accept a received friend request from user with given ID
router.post("/accept/:id",
    isLoggedIn,
    wrapAsync(friendController.acceptRequest)
);

// Reject a received friend request from user with given ID
router.post("/reject/:id",
    isLoggedIn,
    wrapAsync(friendController.rejectRequest)
);

// Remove an existing friend by user ID
router.post("/remove/:id",
    isLoggedIn,
    wrapAsync(friendController.removeFriends)
);

// View all pending requests (both sent and received)
router.get("/pending-requests", 
    isLoggedIn, 
    wrapAsync(friendController.getRequests)
);

// View all friends or requests
router.get("/list", 
    isLoggedIn, 
    wrapAsync(friendController.getFriends)
);

// Check relationship status with a user by ID
router.get("/status/:id", 
    isLoggedIn, 
    wrapAsync(friendController.checkStatus)
);

// Search users by username
router.get("/search", 
    isLoggedIn, 
    wrapAsync(friendController.searchUser)
);

// Export the router to use in main app
module.exports = router;
