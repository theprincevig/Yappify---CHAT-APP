const express = require('express');                     // Import Express
const wrapAsync = require('../middleware/wrapAsync');   // Async error wrapper
const router = express.Router();                        // Create a router instance
const messageController = require('../controller/message.js'); // Controller for message-related actions
const { isLoggedIn } = require('../middleware/auth.js');      // Auth middleware
const multer = require('multer');                       // Multer for file uploads
const { storage } = require('../config/cloudConfig.js');      // Cloudinary storage configuration
const upload = multer({ storage });                     // Multer instance using Cloudinary storage

// --------------------
// Routes for Messages
// --------------------

// Get list of friends/chats for sidebar
router.get("/", 
    isLoggedIn, 
    wrapAsync(messageController.getUsersForSidebar)
);

// Get unread message counts for all chats
router.get("/unread-counts", 
    isLoggedIn, 
    wrapAsync(messageController.getUnreadCounts)
);

// Get messages from a chat or send a new message
router.route("/:chatId/message")
    // Fetch paginated messages for a specific chat
    .get(isLoggedIn, wrapAsync(messageController.getMessages))
    // Send a new message (text or media) to a specific chat
    .post(
        isLoggedIn,
        upload.single("media"),                  // Handle single file upload named 'media'
        wrapAsync(messageController.sendMessage)
    );

// Delete a message by its ID
router.delete("/message/:messageId", 
    isLoggedIn, 
    wrapAsync(messageController.deleteMessage)
);

// React to a message with an emoji
router.post("/message/:messageId/react", 
    isLoggedIn, 
    wrapAsync(messageController.reactToMessage)
);

// Forward a message to another chat
router.post("/message/:messageId/forward", 
    isLoggedIn, 
    wrapAsync(messageController.forwardMessage)
);

// Mark all messages in a chat as read
router.put("/message/mark-read/:chatId", 
    isLoggedIn, 
    wrapAsync(messageController.markMessagesAsRead)
);

// Export the router to use in main app
module.exports = router;
